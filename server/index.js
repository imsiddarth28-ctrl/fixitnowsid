const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Initialize Express & HTTP Server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
// Railway/Render require 'server.listen' and support persistent WebSockets
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this to your frontend URL for production security
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Models
const User = require('./models/User');
const Technician = require('./models/Technician');
const Job = require('./models/Job');
const Payment = require('./models/Payment');
const Complaint = require('./models/Complaint');

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// --- REAL-TIME ENGINE (Socket.IO) ---
io.on('connection', (socket) => {
  console.log('📡 User connected:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined room`);
  });

  socket.on('technician_response', async ({ jobId, status, customerId }) => {
    try {
      const job = await Job.findByIdAndUpdate(jobId, { status }, { new: true });
      io.to(customerId).emit('job_update', { job });
    } catch (err) {
      console.error('Job response error:', err);
    }
  });

  socket.on('update_location', ({ jobId, location }) => {
    io.emit('technician_location_update', { jobId, location });
  });

  socket.on('disconnect', () => {
    console.log('🔌 User disconnected');
  });
});

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('FixItNow Real-Time Server Active 🚀');
});

// API: Technician Discovery
app.get('/api/technicians', async (req, res) => {
  try {
    const techs = await Technician.find({ isAvailable: true, isVerified: true });
    res.json(techs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Booking Engine with Socket Alerts
app.post('/api/bookings', async (req, res) => {
  try {
    const { technicianId, customerId, serviceType, location, price, description, isEmergency } = req.body;

    const newJob = new Job({
      technicianId,
      customerId,
      serviceType,
      location,
      price,
      description,
      isEmergency,
      status: 'pending'
    });
    await newJob.save();

    const customer = await User.findById(customerId);

    // INSTANT ALERT TO TECH
    io.to(technicianId).emit('new_job_request', {
      job: newJob,
      customerName: customer ? customer.name : 'A Customer'
    });

    res.status(201).json(newJob);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Booking History
app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;
    const query = role === 'technician' ? { technicianId: userId } : { customerId: userId };
    const jobs = await Job.find(query)
      .populate('technicianId', 'name serviceType')
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Status & Notify
app.put('/api/jobs/:jobId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.jobId, { status }, { new: true });

    // Notify Customer instantly
    io.to(job.customerId.toString()).emit('job_update', { job });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Admin Reports
app.get('/api/admin/technicians', async (req, res) => {
  try {
    const techs = await Technician.find({}).sort({ joinedAt: -1 });
    res.json(techs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/bookings', async (req, res) => {
  try {
    const jobs = await Job.find({})
      .populate('technicianId', 'name phone')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server (Essential for Railway/Render/Heroku)
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Real-time engine live on port ${PORT}`);
});

module.exports = app; // For local testing utility
