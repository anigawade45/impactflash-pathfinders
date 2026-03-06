const ImpactStory = require('../models/ImpactStory');

// Get all impact stories for public feed
exports.getAllStories = async (req, res) => {
    try {
        const stories = await ImpactStory.find()
            .populate('ngoId', 'name')
            .sort({ createdAt: -1 });

        // Ensure donation amounts are removed and anonymity is respected
        const sanitized = stories.map(story => ({
            ...story._doc,
            donors: story.donors.map(d => ({
                name: d.isAnonymous ? 'Anonymous Donor' : d.name
            }))
        }));

        res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single story details
exports.getStoryById = async (req, res) => {
    try {
        const story = await ImpactStory.findById(req.params.id).populate('ngoId', 'name');
        if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

        const sanitized = {
            ...story._doc,
            donors: story.donors.map(d => ({
                name: d.isAnonymous ? 'Anonymous Donor' : d.name
            }))
        };

        res.status(200).json({ success: true, data: sanitized });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
