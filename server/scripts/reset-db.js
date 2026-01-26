const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' }); // Load env vars from parent directory

// Import Models
const User = require('../models/User');
const Technician = require('../models/Technician');
const Job = require('../models/Job');
// Add other models if needed

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sahakar';

const resetDatabase = async () => {
    try {
        console.log('Connecting to database:', MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        console.log('🗑️  Deleting all Users...');
        await User.deleteMany({});

        console.log('🗑️  Deleting all Technicians...');
        await Technician.deleteMany({});

        console.log('🗑️  Deleting all Jobs...');
        await Job.deleteMany({});

        // Add more deleteMany calls if you have more collections (Ratings, etc.)

        console.log('✨ Database successfully wiped clean!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error resetting database:', error);
        process.exit(1);
    }
};

resetDatabase();
