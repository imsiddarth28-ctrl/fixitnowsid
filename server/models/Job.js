const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    serviceType: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'on_way', 'arrived', 'in_progress', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    location: {
        address: String,
        latitude: Number,
        longitude: Number
    },
    price: { type: Number },
    description: String,
    scheduledTime: Date,
    completedAt: Date,
    isEmergency: { type: Boolean, default: false },
    isQueued: { type: Boolean, default: false },
    rating: Number,
    review: String
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);
