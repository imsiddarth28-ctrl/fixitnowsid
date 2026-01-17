const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    serviceType: { type: String, required: true }, // e.g., 'Plumber', 'Electrician'
    experience: { type: Number, default: 0 }, // Years of experience
    isAvailable: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false }, // Admin block
    idProofUrl: { type: String }, // URL to uploaded ID
    currentLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        lastUpdated: { type: Date, default: Date.now }
    },
    rating: { type: Number, default: 5.0 },
    totalJobs: { type: Number, default: 0 },
    earnings: { type: Number, default: 0.0 },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Technician', technicianSchema);
