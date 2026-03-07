const ImpactStory = require('../models/ImpactStory');
const Donation = require('../models/Donation');

// Get all impact stories for public feed
exports.getAllStories = async (req, res) => {
    try {
        const stories = await ImpactStory.find()
            .populate('ngoId', 'name')
            .sort({ createdAt: -1 });

        // Ensure donation amounts are removed and anonymity is respected
        const sanitized = stories.map(story => {
            const doc = story._doc || story;
            return {
                ...doc,
                donors: (doc.donors || []).map(d => ({
                    name: d.isAnonymous ? 'Anonymous' : (d.name || 'Anonymous')
                }))
            };
        });

        res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single story details
exports.getStoryById = async (req, res) => {
    try {
        const story = await ImpactStory.findById(req.params.id).populate('ngoId', 'name');
        if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

        const doc = story._doc || story;
        const sanitized = {
            ...doc,
            donors: (doc.donors || []).map(d => ({
                name: d.isAnonymous ? 'Anonymous' : (d.name || 'Anonymous')
            }))
        };

        res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get stories for a specific donor
exports.getStoriesByDonor = async (req, res) => {
    try {
        // 1. Get all completed donations by this donor
        const donations = await Donation.find({
            donorId: req.userId,
            paymentStatus: 'completed'
        });

        // 2. Extract unique target IDs (Needs/Campaigns) the donor has supported
        const targetIds = [];
        donations.forEach(d => {
            d.items.forEach(item => {
                targetIds.push(item.targetId);
            });
        });

        // 3. Find stories where the donor is explicitly mentioned OR stories for the items they supported
        const stories = await ImpactStory.find({
            $or: [
                { 'donors.donorId': req.userId },
                { itemId: { $in: targetIds } }
            ]
        })
            .populate('ngoId', 'name')
            .sort({ createdAt: -1 });

        const sanitized = stories.map(story => {
            const doc = story._doc || story;
            const isTargetSupported = targetIds.some(id => id.toString() === doc.itemId?.toString());
            const isDonorListed = (doc.donors || []).some(d => d.donorId?.toString() === req.userId.toString());

            return {
                ...doc,
                supportedByUser: isTargetSupported || isDonorListed,
                donors: (doc.donors || []).map(d => ({
                    name: d.isAnonymous ? 'Anonymous' : (d.name || 'Anonymous')
                }))
            };
        });

        res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get stories for a specific NGO
exports.getStoriesByNgo = async (req, res) => {
    try {
        const ngoId = req.params.ngoId || req.userId;
        const stories = await ImpactStory.find({ ngoId })
            .populate('ngoId', 'name')
            .sort({ createdAt: -1 });

        const sanitized = stories.map(story => {
            const doc = story._doc || story;
            return {
                ...doc,
                donors: (doc.donors || []).map(d => ({
                    name: d.isAnonymous ? 'Anonymous' : (d.name || 'Anonymous')
                }))
            };
        });

        res.status(200).json({ success: true, count: sanitized.length, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};