const Donor = require('../models/Donor');
const generateToken = require('../utils/generateToken');

exports.registerDonor = async (req, res) => {
    try {
        const { name, email, causes } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const existing = await Donor.findOne({ email: normalizedEmail });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }

        const donor = new Donor({
            name,
            email: normalizedEmail,
            causes
        });

        await donor.save();
        generateToken(res, donor._id, 'donor');

        res.status(201).json({
            success: true,
            data: donor
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
