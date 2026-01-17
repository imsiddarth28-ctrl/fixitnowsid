const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Technician = require('../models/Technician');

// SECRET
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_fixitnow';

// REGISTER USER
router.post('/register/user', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        // Check if email exists in User collection
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered as a customer' });
        }

        // Check if email exists in Technician collection (prevent role switching)
        const existingTech = await Technician.findOne({ email });
        if (existingTech) {
            return res.status(400).json({ message: 'This email is already registered as a technician. Please use a different email or login as technician.' });
        }

        // Check if phone number is already used
        const existingUserByPhone = await User.findOne({ phone });
        const existingTechByPhone = await Technician.findOne({ phone });
        if (existingUserByPhone || existingTechByPhone) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, phone });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// REGISTER TECHNICIAN
router.post('/register/technician', async (req, res) => {
    try {
        const { name, email, password, phone, serviceType } = req.body;

        // Check if email exists in Technician collection
        const existingTech = await Technician.findOne({ email });
        if (existingTech) {
            return res.status(400).json({ message: 'Email already registered as a technician' });
        }

        // Check if email exists in User collection (prevent role switching)
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'This email is already registered as a customer. Please use a different email or login as customer.' });
        }

        // Check if phone number is already used
        const existingUserByPhone = await User.findOne({ phone });
        const existingTechByPhone = await Technician.findOne({ phone });
        if (existingUserByPhone || existingTechByPhone) {
            return res.status(400).json({ message: 'Phone number already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const tech = new Technician({
            name,
            email,
            password: hashedPassword,
            phone,
            serviceType,
            isAvailable: true,  // Make live immediately
            isVerified: true    // Auto-verify for demo/ease of use
        });
        await tech.save();

        res.status(201).json({ message: 'Technician registered successfully and is now active.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// LOGIN (Generic)
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body; // role: 'user' or 'technician'

        let user;
        if (role === 'technician') {
            user = await Technician.findOne({ email });
        } else {
            // Check User collection for both 'customer' and 'admin'
            user = await User.findOne({ email });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // If user is trying to login as admin, verify database role is admin
        if (role === 'admin' && user.role !== 'admin') {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Ensure we send back the correct role
        const finalRole = role === 'technician' ? 'technician' : user.role;

        const token = jwt.sign({ id: user._id, role: finalRole }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token, user: { id: user._id, name: user.name, role: finalRole } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE USER PROFILE
router.put('/profile/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, profilePhoto, address, bio } = req.body;

        // Prepare update object (only include provided fields)
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) {
            // Check if new phone is already used by another user
            const existingUserByPhone = await User.findOne({ phone, _id: { $ne: id } });
            const existingTechByPhone = await Technician.findOne({ phone });
            if (existingUserByPhone || existingTechByPhone) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
            updateData.phone = phone;
        }
        if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
        if (address !== undefined) updateData.address = address;
        if (bio !== undefined) updateData.bio = bio;

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE TECHNICIAN PROFILE
router.put('/profile/technician/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone, profilePhoto, address, bio, experience, serviceType } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (phone) {
            // Check if new phone is already used
            const existingTechByPhone = await Technician.findOne({ phone, _id: { $ne: id } });
            const existingUserByPhone = await User.findOne({ phone });
            if (existingTechByPhone || existingUserByPhone) {
                return res.status(400).json({ message: 'Phone number already in use' });
            }
            updateData.phone = phone;
        }
        if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
        if (address !== undefined) updateData.address = address;
        if (bio !== undefined) updateData.bio = bio;
        if (experience !== undefined) updateData.experience = experience;
        if (serviceType) updateData.serviceType = serviceType;

        const updatedTech = await Technician.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
        if (!updatedTech) {
            return res.status(404).json({ message: 'Technician not found' });
        }

        res.json({ message: 'Profile updated successfully', technician: updatedTech });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
