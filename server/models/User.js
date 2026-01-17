const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    savedLocations: [{
        label: String,
        address: String,
        latitude: Number,
        longitude: Number
    }],
    walletBalance: { type: Number, default: 0 },
    notifications: [{
        message: String,
        read: { type: Boolean, default: false },
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
