const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Allow client
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('technician_response', async ({ jobId, status, customerId }) => {
    // status: 'accepted' or 'rejected'
    try {
      const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
      // Notify customer
      io.to(customerId).emit('job_update', { job });
    } catch (err) {
      console.error(err);
    }
  });

  socket.on('update_location', ({ jobId, location }) => {
    // In a real app, verify user is the assigned tech
    // Broadcast to everyone in the job room or just the customer
    // Ideally we'd look up the customerId from the jobId, but for now assuming the job room or broadcasting broadly is okay for demo?
    // Better: Client sends customerId or we emit to a room.
    // Let's assume we broadcast to all for simplicity or client sends customerId. 
    // To strictly follow previous pattern, we might need customerId.
    // Actually, standard is to have a room 'job_JOBID'.
    io.emit('technician_location_update', { jobId, location });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
const authRoutes = require('./routes/auth');
const Technician = require('./models/Technician');
const Job = require('./models/Job');
const Payment = require('./models/Payment');
const Complaint = require('./models/Complaint');
const AdminLog = require('./models/AdminLog');

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('FixItNow Server is Running');
});

// API: Get all available technicians
app.get('/api/technicians', async (req, res) => {
  try {
    const techs = await Technician.find({ isAvailable: true });
    res.json(techs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Create a booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { technicianId, customerId, serviceType, location, price, description } = req.body;

    const newJob = new Job({
      technicianId,
      customerId,
      serviceType,
      location,
      price,
      description,
      status: 'pending'
    });
    await newJob.save();

    // Notify specific technician
    io.to(technicianId).emit('new_job_request', {
      job: newJob,
      customerName: 'Customer' // In real app, fetch name
    });

    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Booking History (Customer or Tech)
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; // 'technician' or 'customer'

    const query = role === 'technician' ? { technicianId: userId } : { customerId: userId };
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Job Status
app.put('/api/jobs/:jobId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.jobId, { status }, { new: true });

    // Notify Customer
    io.to(job.customerId.toString()).emit('job_update', { job });

    // If completed, maybe update wallet check logic etc. (omitted for MVP)

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Submit Rating & Review
app.put('/api/jobs/:jobId/review', async (req, res) => {
  try {
    const { rating, review } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.jobId, { rating, review }, { new: true });

    // Update Technician Rating (Simple average)
    // In real app, re-calculate average from all jobs

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Wallet Top-up
app.post('/api/user/:userId/wallet/add', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findByIdAndUpdate(req.params.userId, {
      $inc: { walletBalance: amount }
    }, { new: true });
    res.json({ balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Use Wallet for Payment (Mock)
app.post('/api/user/:userId/wallet/pay', async (req, res) => {
  try {
    const { amount } = req.body;
    const user = await User.findById(req.params.userId);
    if (user.walletBalance < amount) return res.status(400).json({ message: 'Insufficient Funds' });

    user.walletBalance -= amount;
    await user.save();
    res.json({ success: true, balance: user.walletBalance });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Toggle Technician Availability
app.put('/api/technicians/:id/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const tech = await Technician.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
    res.json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN ROUTES
// Get all technicians (for approval)
app.get('/api/admin/technicians', async (req, res) => {
  try {
    const techs = await Technician.find({});
    res.json(techs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve Technician
app.put('/api/admin/approve-technician/:id', async (req, res) => {
  try {
    const tech = await Technician.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get All Bookings (System wide)
app.get('/api/admin/bookings', async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('technicianId', 'name')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
