const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Import bcrypt
const User = require('./models/User');
const Technician = require('./models/Technician');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fixitnow';

const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB for Seeding');

        // Clear existing data
        await User.deleteMany({});
        await Technician.deleteMany({});
        console.log('Cleared existing data');

        const hashedUserPass = await bcrypt.hash('password123', 10);
        const hashedAdminPass = await bcrypt.hash('adminpass', 10);
        const hashedTechPass = await bcrypt.hash('pass', 10);

        // Create Dummy Users
        const users = await User.insertMany([
            { name: 'Alice Customer', email: 'alice@example.com', password: hashedUserPass, phone: '555-0101' },
            { name: 'Bob Admin', email: 'admin@fixitnow.com', password: hashedAdminPass, role: 'admin' }
        ]);
        console.log('Users seeded');

        // Create Dummy Technicians
        const technicians = await Technician.insertMany([
            {
                name: 'Mario Plumber',
                email: 'mario@fixit.com',
                password: hashedTechPass,
                phone: '555-0202',
                serviceType: 'Plumber',
                isAvailable: true,
                currentLocation: { latitude: 40.7128, longitude: -74.0060 }, // NYC approx
                rating: 4.8
            },
            {
                name: 'Luigi Electrician',
                email: 'luigi@fixit.com',
                password: hashedTechPass,
                phone: '555-0303',
                serviceType: 'Electrician',
                isAvailable: true,
                currentLocation: { latitude: 40.7300, longitude: -73.9900 },
                rating: 4.9
            }
        ]);
        console.log('Technicians seeded');

        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedData();
