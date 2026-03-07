const mongoose = require('mongoose');
const NGO = require('../models/NGO');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/impactflash';

const seedNgo = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB connected for seeding NGO...');

        const ngoEmail = 'DELHI.CIT.EXMP@INCOMETAX.GOV.IN';
        const existingNgo = await NGO.findOne({ email: ngoEmail.toLowerCase() });

        if (existingNgo) {
            console.log(`NGO with email ${ngoEmail} already exists.`);
        } else {
            const newNgo = new NGO({
                name: 'Income Tax Exemption Nodal Agency',
                email: ngoEmail.toLowerCase(),
                password: 'password123', // Default password for testing
                ngoId: 'NGO-GOV-DELHI-001',
                registrationNumber: 'IT-EXMP-2024-001',
                isFcraRegistered: true,
                fcraNumber: '123456789',
                panCard: 'AAAGP0000Z',
                address: 'C.R. Building, I.P. Estate, New Delhi - 110002',
                website: 'https://incometaxindia.gov.in',
                workingAreas: ['Regulatory Oversight', 'Transparency Verification'],
                registrationCertificate: 'https://res.cloudinary.com/demo/image/upload/v1/certificates/gov_cert.pdf',
                bankAccount: {
                    accountNumber: '100020003000',
                    ifscCode: 'SBIN0000691',
                    bankName: 'State Bank of India'
                },
                representative: {
                    name: 'Commissioner of IT (Exemptions)'
                },
                status: 'verified',
                trustScore: 100,
                impactScore: 100,
                aiVerdict: 'TRUSTED GOVERNMENT ENTITY',
                automatedChecks: {
                    fcraVerified: true,
                    panVerified: true,
                    aadhaarVerified: true,
                    pennyDropSuccessful: true,
                    visionAuthentic: true,
                    addressMatched: true
                }
            });

            await newNgo.save();
            console.log(`Successfully created NGO: ${ngoEmail}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding NGO:', error);
        process.exit(1);
    }
};

seedNgo();
