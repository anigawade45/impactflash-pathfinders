const NGO = require('../models/NGO');
const Need = require('../models/Need');
const Campaign = require('../models/Campaign');
const ImpactStory = require('../models/ImpactStory');
const AuditLog = require('../models/AuditLog');
const Donation = require('../models/Donation');

// 1. Every verified NGO + Trust Score
exports.getPublicNgos = async (req, res) => {
    try {
        const ngos = await NGO.find({ status: 'verified' })
            .select('name address trustScore createdAt')
            .sort({ trustScore: -1 });
        res.status(200).json({ success: true, count: ngos.length, data: ngos });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Every active need + AI score
exports.getPublicNeeds = async (req, res) => {
    try {
        const needs = await Need.find({ status: 'live' })
            .select('title category urgency amount beneficiaries deadline aiScore fundsRaised fundStatus')
            .populate('ngoId', 'name trustScore')
            .sort({ aiScore: -1 });
        res.status(200).json({ success: true, count: needs.length, data: needs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Every campaign + progress
exports.getPublicCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'live' })
            .select('title story targetAmount fundsRaised photos aiScore fundStatus')
            .populate('ngoId', 'name trustScore')
            .sort({ aiScore: -1 });
        res.status(200).json({ success: true, count: campaigns.length, data: campaigns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Admin Decision Logs (Public Accountability)
exports.getPublicAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('adminId', 'name')
            .select('action targetType details createdAt') // IP and Agent hidden
            .sort({ createdAt: -1 })
            .limit(50);
        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Total Platform Stats
exports.getPlatformStats = async (req, res) => {
    try {
        const totalDonations = await Donation.aggregate([
            { $match: { paymentStatus: 'completed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);

        const categoryBreakdown = await Need.aggregate([
            { $match: { status: 'live' } },
            { $group: { _id: '$category', totalRequested: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);

        const impactStoriesCount = await ImpactStory.countDocuments();
        const verifiedNgosCount = await NGO.countDocuments({ status: 'verified' });

        res.status(200).json({
            success: true,
            data: {
                totalAllocated: totalDonations[0]?.total || 0,
                verifiedNgos: verifiedNgosCount,
                impactStories: impactStoriesCount,
                categoryBreakdown
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Every Impact Story + Proofs
exports.getPublicStories = async (req, res) => {
    try {
        const stories = await ImpactStory.find()
            .populate('ngoId', 'name trustScore')
            .sort({ createdAt: -1 });

        // Remove individual donor details to maintain privacy ledger standards
        const sanitized = stories.map(story => ({
            ...story._doc,
            donorsCount: story.donors.length,
            donors: story.donors.map(d => ({
                name: d.isAnonymous ? 'Anonymous' : d.name
            }))
        }));

        res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
