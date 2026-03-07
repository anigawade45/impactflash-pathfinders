const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/impactflash';

const seedAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding...');

        const adminEmail = 'admin@impactflash.com';
        const existingAdmin = await Admin.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log(`Admin with email ${adminEmail} already exists.`);
        } else {
            const newAdmin = new Admin({
                name: 'System Admin',
                email: adminEmail,
                role: 'admin'
            });

            await newAdmin.save();
            console.log(`Successfully created admin: ${adminEmail}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
