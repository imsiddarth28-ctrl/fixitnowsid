const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
    action: { type: String, required: true }, // e.g., 'approve_tech', 'block_user'
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetId: { type: mongoose.Schema.Types.ObjectId }, // User or Tech ID affected
    details: String,
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdminLog', adminLogSchema);
