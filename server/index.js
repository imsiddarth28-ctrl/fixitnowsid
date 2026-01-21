const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Pusher = require('pusher');
require('dotenv').config();
const connectToDatabase = require('./lib/mongodb');

// Initialize Express
const app = express();

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Middleware
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Models
const User = require('./models/User');
const Technician = require('./models/Technician');
const Job = require('./models/Job');
const Payment = require('./models/Payment');
const Complaint = require('./models/Complaint');
const Message = require('./models/Message');

// Routes
// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('FixItNow Vercel-Native Real-Time Server Active 🚀 (Pusher Powered)');
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', message: 'API is live', database: 'connected' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

// API: Send Message & Trigger Pusher
app.post('/api/messages', async (req, res) => {
  try {
    const { jobId, senderId, senderRole, text, receiverId } = req.body;
    const newMessage = new Message({ jobId, senderId, senderRole, text });
    await newMessage.save();

    // Trigger Pusher event on the job channel
    await pusher.trigger(`job-${jobId}`, 'receive_message', newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Chat History
app.get('/api/chat/:jobId', async (req, res) => {
  try {
    const messages = await Message.find({ jobId: req.params.jobId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Technician Location & Trigger Real-time Updates
app.post('/api/jobs/:jobId/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const { jobId } = req.params;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    // Update job with technician's current location
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Store technician location in job
    job.technicianCurrentLocation = {
      latitude,
      longitude,
      timestamp: new Date()
    };
    await job.save();

    // Broadcast location update to all clients watching this job
    await pusher.trigger(`job-${jobId}`, 'technician_location_update', {
      jobId,
      latitude,
      longitude,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, location: { latitude, longitude } });
  } catch (err) {
    console.error('Location update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// API: Cancel Job with Reason
app.post('/api/jobs/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { reason, reasonLabel, details, cancelledBy, cancelledAt } = req.body;

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Update job status and add cancellation data
    job.status = 'cancelled';
    job.cancellationData = {
      reason,
      reasonLabel,
      details,
      cancelledBy,
      cancelledAt: cancelledAt || new Date().toISOString()
    };
    await job.save();

    // Notify the other party via Pusher
    await pusher.trigger(`job-${jobId}`, 'job_cancelled', {
      jobId,
      status: 'cancelled',
      cancellationData: job.cancellationData,
      message: `Job cancelled by ${cancelledBy}: ${reasonLabel}`
    });

    // Also notify user-specific channels
    if (job.customerId) {
      await pusher.trigger(`user-${job.customerId}`, 'job_cancelled', {
        jobId,
        message: 'Your job has been cancelled'
      });
    }
    if (job.technicianId) {
      await pusher.trigger(`user-${job.technicianId}`, 'job_cancelled', {
        jobId,
        message: 'Job has been cancelled'
      });
    }

    res.json({
      success: true,
      job,
      message: 'Job cancelled successfully'
    });
  } catch (err) {
    console.error('Cancel job error:', err);
    res.status(500).json({ error: err.message });
  }
});


// API: Technician Discovery
app.get('/api/technicians', async (req, res) => {
  try {
    const techs = await Technician.find({ isVerified: true, isBlocked: false });
    const techsWithStatus = await Promise.all(techs.map(async (tech) => {
      const activeJob = await Job.findOne({
        technicianId: tech._id,
        status: { $in: ['accepted', 'on_way', 'arrived', 'in_progress'] }
      });
      const techObj = tech.toObject();
      techObj.isBusy = !!activeJob;
      techObj.currentJobId = activeJob ? activeJob._id : null;
      return techObj;
    }));
    res.json(techsWithStatus);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Update Technician Availability
app.put('/api/technicians/:id/availability', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const tech = await Technician.findByIdAndUpdate(req.params.id, { isAvailable }, { new: true });
    res.json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Get Technician Stats
app.get('/api/technicians/:id/stats', async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id);
    if (!tech) return res.status(404).json({ error: 'Technician not found' });
    const recentJobs = await Job.find({ technicianId: req.params.id })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({
      earnings: tech.earnings,
      totalJobs: tech.totalJobs,
      rating: tech.rating,
      recentJobs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Booking Engine with Pusher Alerts
app.post('/api/bookings', async (req, res) => {
  try {
    const { technicianId, customerId, serviceType, location, price, description, isEmergency } = req.body;

    console.log('[BOOKING REQUEST]', { technicianId, customerId, serviceType });

    if (!technicianId || !customerId) {
      return res.status(400).json({ error: 'Missing technicianId or customerId' });
    }

    // 1. Check if user and technician exist
    const [customer, tech] = await Promise.all([
      User.findById(customerId),
      Technician.findById(technicianId)
    ]);

    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    if (!tech) return res.status(404).json({ error: 'Technician not found' });

    // 2. IDEMPOTENCY: Check if there's already a PENDING booking from this customer for this tech
    const existingPending = await Job.findOne({
      customerId,
      technicianId,
      status: 'pending'
    });

    if (existingPending) {
      return res.status(409).json({
        error: 'Duplicate Request',
        message: 'You already have a pending booking request with this technician.'
      });
    }

    // 3. Check if tech is currently busy with another mission
    const activeMission = await Job.findOne({
      technicianId,
      status: { $in: ['accepted', 'on_way', 'arrived', 'in_progress'] }
    });

    const newJob = new Job({
      technicianId, customerId, serviceType, location, price, description, isEmergency, status: 'pending'
    });

    if (activeMission) newJob.isQueued = true;

    await newJob.save();

    // 4. Notify technician via Pusher
    try {
      await pusher.trigger(`user-${technicianId}`, 'new_job_request', {
        job: newJob,
        isQueued: !!activeMission,
        customerName: customer.name || 'A Customer'
      });
      console.log('[BOOKING SUCCESS] Pusher notified technician');
    } catch (pusherErr) {
      console.error('[PUSHER ERROR]', pusherErr);
      // We still return 201 because the job is saved in DB
    }

    res.status(201).json(newJob);
  } catch (err) {
    console.error('[BOOKING 500 ERROR]', err);
    res.status(500).json({ error: 'Server Error', message: err.message });
  }
});

// Alias for /api/bookings/create
app.post('/api/bookings/create', async (req, res) => {
  try {
    const { technicianId, customerId, status } = req.body;

    // Check for active booking first
    const activeBooking = await Job.findOne({
      customerId,
      status: { $in: ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'] }
    });

    if (activeBooking) {
      return res.status(400).json({ message: 'You already have an active booking.' });
    }

    const job = new Job({ ...req.body });
    await job.save();

    // Trigger notification to technician
    await pusher.trigger(`user-${technicianId}`, 'new_job_request', { job });

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Customer Dashboard Stats
app.get('/api/customers/:id/dashboard', async (req, res) => {
  try {
    const userId = req.params.id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [activeJobs, completedJobs, recentJobs, allJobs] = await Promise.all([
      Job.countDocuments({ customerId: userId, status: { $in: ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'] } }),
      Job.countDocuments({ customerId: userId, status: 'completed' }),
      Job.countDocuments({ customerId: userId, status: 'completed', updatedAt: { $gte: thirtyDaysAgo } }),
      Job.find({ customerId: userId, status: 'completed' })
    ]);

    const totalSpent = allJobs.reduce((acc, job) => acc + (job.price || 0), 0);

    // Dynamic trust score logic (placeholder)
    const trustScore = 4.9;
    const trustLabel = "EXCELLENT";

    const stats = {
      activeJobs,
      completedJobs,
      totalSpent,
      trends: {
        active: activeJobs > 0 ? "LIVE" : "DORMANT",
        completed: recentJobs > 0 ? `+${recentJobs}` : "0",
        spent: totalSpent > 500 ? "PREMIUM" : "BASIC",
        trust: { score: trustScore, label: trustLabel }
      }
    };
    res.json({ stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Technician Dashboard Stats
app.get('/api/technicians/:id/dashboard', async (req, res) => {
  try {
    const techId = req.params.id;
    const stats = {
      activeJobs: await Job.countDocuments({ technicianId: techId, status: { $in: ['accepted', 'on_way', 'arrived', 'in_progress'] } }),
      completedToday: await Job.countDocuments({
        technicianId: techId,
        status: 'completed',
        updatedAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      totalEarnings: (await Job.find({ technicianId: techId, status: 'completed' })).reduce((acc, job) => acc + (job.price || 0), 0),
      pendingRequests: await Job.countDocuments({ technicianId: techId, status: 'pending' })
    };

    const pendingRequests = await Job.find({ technicianId: techId, status: 'pending' })
      .populate('customerId', 'name')
      .sort({ createdAt: -1 });

    res.json({ stats, pendingRequests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Check Customer Active Booking
app.get('/api/customers/:id/active-booking', async (req, res) => {
  try {
    const job = await Job.findOne({
      customerId: req.params.id,
      status: { $in: ['pending', 'accepted', 'on_way', 'arrived', 'in_progress'] }
    });
    res.json({ hasActiveBooking: !!job, job });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Technician Availability & Busy Status
app.get('/api/technicians/:id/availability', async (req, res) => {
  try {
    const tech = await Technician.findById(req.params.id);
    const activeJob = await Job.findOne({
      technicianId: req.params.id,
      status: { $in: ['accepted', 'on_way', 'arrived', 'in_progress'] }
    });

    res.json({
      isAvailable: tech.isAvailable,
      isBusy: !!activeJob,
      estimatedFreeTime: activeJob ? new Date(Date.now() + 45 * 60000) : null // Placeholder 45 mins
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Cancel Job
app.post('/api/jobs/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const cancellationData = req.body;

    const job = await Job.findByIdAndUpdate(jobId, {
      status: 'cancelled',
      cancellationData: {
        ...cancellationData,
        cancelledAt: new Date()
      }
    }, { new: true })
      .populate('customerId')
      .populate('technicianId');

    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Notify both parties
    await pusher.trigger(`user-${job.customerId._id || job.customerId}`, 'job_cancelled', { job });
    await pusher.trigger(`user-${job.technicianId._id || job.technicianId}`, 'job_cancelled', { job });

    res.json({ success: true, job });
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

// API: Update Status & Notify via Pusher
app.put('/api/jobs/:jobId/status', async (req, res) => {
  try {
    const { status } = req.body;
    const updateData = { status };
    if (status === 'completed') updateData.completedAt = new Date();

    const job = await Job.findByIdAndUpdate(req.params.jobId, updateData, { new: true })
      .populate('customerId', 'name phone')
      .populate('technicianId', 'name phone serviceType');

    if (status === 'completed' && job.technicianId) {
      // Tech earnings update happens with populated object too
      await Technician.findByIdAndUpdate(job.technicianId._id, {
        $inc: { totalJobs: 1, earnings: job.price || 0 }
      });
    }

    // Notify BOTH Parties via Pusher
    if (job.customerId) {
      await pusher.trigger(`user-${job.customerId._id || job.customerId}`, 'job_update', { job });
    }
    if (job.technicianId) {
      await pusher.trigger(`user-${job.technicianId._id || job.technicianId}`, 'job_update', { job });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Rate Job
app.put('/api/jobs/:jobId/rate', async (req, res) => {
  try {
    const { rating, review } = req.body;
    const job = await Job.findByIdAndUpdate(req.params.jobId, { rating, review }, { new: true });
    if (job.technicianId) {
      const allRatedJobs = await Job.find({ technicianId: job.technicianId, rating: { $exists: true } });
      const avgRating = allRatedJobs.reduce((acc, current) => acc + current.rating, 0) / allRatedJobs.length;
      await Technician.findByIdAndUpdate(job.technicianId, { rating: avgRating.toFixed(2) });
    }
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

// API: Admin Tech Control
app.put('/api/admin/approve-technician/:id', async (req, res) => {
  try {
    const tech = await Technician.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
    res.json(tech);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/admin/block-technician/:id', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const tech = await Technician.findByIdAndUpdate(req.params.id, { isBlocked }, { new: true });
    res.json(tech);
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

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Real-time logic (Pusher triggered) live on port ${PORT}`);
});

module.exports = app;
