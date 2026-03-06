const Donor = require('../models/Donor');
const NGO = require('../models/NGO');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

exports.registerDonor = async (req, res) => {
    try {
        const { name, email, password, causes, defaultVisibility } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        const existingDonor = await Donor.findOne({ email: normalizedEmail });
        const existingNgo = await NGO.findOne({ email: normalizedEmail });
        const existingAdmin = await Admin.findOne({ email: normalizedEmail });

        if (existingDonor || existingNgo || existingAdmin) {
            return res.status(400).json({ success: false, message: 'This email is already registered on the platform.' });
        }

        const donor = new Donor({
            name,
            email: normalizedEmail,
            password,
            causes
        });

        await donor.save();
        generateToken(req, res, donor._id, 'donor');

        res.status(201).json({
            success: true,
            data: donor
        });
    } catch (error) {
        console.error('Donor Registration Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'This email is already registered.' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};