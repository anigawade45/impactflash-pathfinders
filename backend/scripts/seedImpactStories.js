const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const NGO = require('../models/NGO');
const Need = require('../models/Need');
const Campaign = require('../models/Campaign');
const ImpactStory = require('../models/ImpactStory');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/impactflash';

async function seedData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB...");

        // 1. Create/Find NGO 1: Rural Health Foundation
        let ngo1 = await NGO.findOne({ name: "Rural Health Foundation" });
        if (!ngo1) {
            ngo1 = await NGO.create({
                name: "Rural Health Foundation",
                email: "info@ruralhealth.org",
                password: "password123", // Will be hashed in pre-save
                ngoId: "RHF-9921",
                registrationNumber: "RHF12345",
                panCard: "RHFPAN12345",
                address: "Sangli, Maharashtra",
                workingAreas: ["Health", "Rural Development"],
                registrationCertificate: "https://example.com/cert.pdf",
                bankAccount: { accountNumber: "1234567890", ifscCode: "SBIN000123", bankName: "SBI" },
                representative: { name: "Dr. Arvind Gadgil" },
                status: "verified",
                trustScore: 88,
                impactScore: 92
            });
            console.log("Created NGO 1: Rural Health Foundation");
        }

        // 2. Create/Find NGO 2: Literacy Now
        let ngo2 = await NGO.findOne({ name: "Literacy Now" });
        if (!ngo2) {
            ngo2 = await NGO.create({
                name: "Literacy Now",
                email: "contact@literacynow.org",
                password: "password123",
                ngoId: "LN-5521",
                registrationNumber: "LN556677",
                panCard: "LNPAN556677",
                address: "Pune, Maharashtra",
                workingAreas: ["Education", "Youth Empowerment"],
                registrationCertificate: "https://example.com/cert2.pdf",
                bankAccount: { accountNumber: "0987654321", ifscCode: "HDFC000456", bankName: "HDFC" },
                representative: { name: "Mrs. Sunita Deshpande" },
                status: "verified",
                trustScore: 91,
                impactScore: 89
            });
            console.log("Created NGO 2: Literacy Now");
        }

        // 3. Create Impact Story 1 (from a completed Need for RHF)
        // Simulate a completed Need
        const need1 = await Need.create({
            ngoId: ngo1._id,
            title: "Mobile Clinic for 15 Remote Villages",
            category: "Health",
            urgency: "high",
            amount: 500000,
            beneficiaries: 1200,
            deadline: new Date(),
            status: "completed",
            fundsRaised: 500000,
            fundsReleased: 500000,
            milestones: [
                { level: 1, title: 'Initiation', status: 'verified', percentage: 40 },
                { level: 2, title: 'Midpoint', status: 'verified', percentage: 40 },
                { level: 3, title: 'Completion', status: 'verified', percentage: 20, outcomeReport: "Successfully served 15 villages with basic checkups and medicine." }
            ]
        });

        await ImpactStory.create({
            itemId: need1._id,
            itemType: "Need",
            title: "Health on Wheels in Sangli",
            ngoId: ngo1._id,
            summary: "1,240 villagers received medical care across 15 remote clusters.",
            content: "The Rural Health Foundation successfully operated a mobile clinic for three months. Dr. Arvind and his team provided free vaccinations, glucose monitoring, and basic treatment to elderly residents who previously had to travel 40km for the nearest clinic.",
            photos: ["https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=1000"],
            beneficiaryCount: 1240,
            financialBreakdown: { totalRaised: 500000, totalSpent: 492000 },
            donors: [{ name: "Ananya Sharma", isAnonymous: false }, { name: "Vikram Mehta", isAnonymous: false }],
            aiValidation: { status: "VERIFIED", score: 94, analysis: "Vision consistent with clinic operations. Beneficiary count matches field reports." }
        });
        console.log("Seeded Impact Story 1");

        // 4. Create Impact Story 2 (from a completed Campaign for RHF)
        const campaign1 = await Campaign.create({
            ngoId: ngo1._id,
            title: "Emergency Cyclone Relief: Coastal Raigad",
            category: "Disaster Relief",
            story: "Providing urgent food and medicine kits.",
            targetAmount: 200000,
            deadline: new Date(),
            status: "completed",
            fundsRaised: 205000,
            milestones: [
                { level: 1, status: 'verified' },
                { level: 2, status: 'verified' },
                { level: 3, status: 'verified', outcomeReport: "Distributed 400 ration kits in 4 coastal villages." }
            ]
        });

        await ImpactStory.create({
            itemId: campaign1._id,
            itemType: "Campaign",
            title: "Resilience in Raigad",
            ngoId: ngo1._id,
            summary: "400 families served with 2-week ration kits during cyclone recovery.",
            content: "Within 48 hours of the funds being released, RHF volunteers were on the ground distributing rice, pulses, oil, and basic medicine. The community's response was overwhelming, and we managed to reach the furthest households using local boats.",
            photos: ["https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=1000"],
            beneficiaryCount: 1600, // 400 families * 4
            financialBreakdown: { totalRaised: 205000, totalSpent: 203500 },
            donors: [{ name: "Rahul Khanna", isAnonymous: false }],
            aiValidation: { status: "VERIFIED", score: 89, analysis: "Aerial and kit distribution photos verified. Cost efficiency remains within target thresholds." }
        });
        console.log("Seeded Impact Story 2");

        // 5. Create Impact Story 3 (from a completed Need for Literacy Now)
        const need2 = await Need.create({
            ngoId: ngo2._id,
            title: "Digital Lab for Underprivileged Girls",
            category: "Education",
            urgency: "medium",
            amount: 300000,
            beneficiaries: 150,
            deadline: new Date(),
            status: "completed",
            fundsRaised: 300000,
            fundsReleased: 300000,
            milestones: [
                { level: 1, status: 'verified' },
                { level: 2, status: 'verified' },
                { level: 3, status: 'verified', outcomeReport: "Set up 10 computers and trained first batch of 40 girls." }
            ]
        });

        await ImpactStory.create({
            itemId: need2._id,
            itemType: "Need",
            title: "Bits for Bright Brains",
            ngoId: ngo2._id,
            summary: "150 girls in Pune slums now have access to high-speed internet and coding workshops.",
            content: "Sunita Deshpande's 'Literacy Now' project has transformed a small community center into a vibrant tech hub. The girls are now learning HTML/CSS and basic data entry, opening up future vocational opportunities. The impact is visible in their confidence and eagerness to learn.",
            photos: ["https://images.unsplash.com/photo-1509062522246-3755907927d7?auto=format&fit=crop&q=80&w=1000"],
            beneficiaryCount: 150,
            financialBreakdown: { totalRaised: 300000, totalSpent: 298000 },
            donors: [{ name: "Arpita Sen", isAnonymous: false }, { name: "Kunal Jaiswal", isAnonymous: false }],
            aiValidation: { status: "VERIFIED", score: 91, analysis: "Lab photos checked for authenticity. Expenditure audit shows 99.3% efficiency." }
        });
        console.log("Seeded Impact Story 3");

        console.log("Seeding complete! Impact Stories generated.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seedData();
