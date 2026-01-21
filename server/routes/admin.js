const express = require('express');
const router = express.Router();
const Technician = require('../models/Technician');
const Job = require('../models/Job');
const User = require('../models/User');
const pusher = require('../lib/pusher');

// GET all technicians (for admin view)
router.get('/technicians', async (req, res) => {
    try {
        const technicians = await Technician.find().sort({ joinedAt: -1 });
        res.json(technicians);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET all bookings/jobs
router.get('/bookings', async (req, res) => {
    try {
        const jobs = await Job.find()
            .populate('customerId', 'name email phone')
            .populate('technicianId', 'name email serviceType')
            .sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// APPROVE a technician
router.put('/approve-technician/:id', async (req, res) => {
    try {
        const tech = await Technician.findByIdAndUpdate(
            req.params.id,
            { isVerified: true },
            { new: true }
        );

        // Notify Technician
        await pusher.trigger(`user-${tech._id}`, 'account_verified', { tech });

        res.json(tech);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// BLOCK/UNBLOCK a technician
router.put('/block-technician/:id', async (req, res) => {
    try {
        const { isBlocked } = req.body;
        const tech = await Technician.findByIdAndUpdate(
            req.params.id,
            { isBlocked },
            { new: true }
        );

        // Notify Technician
        await pusher.trigger(`user-${tech._id}`, 'account_blocked', { isBlocked });

        res.json(tech);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REJECT a technician (Delete Application)
router.delete('/reject-technician/:id', async (req, res) => {
    try {
        await Technician.findByIdAndDelete(req.params.id);
        res.json({ message: 'Technician application rejected and removed.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
