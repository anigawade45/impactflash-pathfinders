const NGO = require('../models/NGO');
const Donor = require('../models/Donor');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
    try {
        const { email } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Check if Admin (New separate collection)
        let user = await Admin.findOne({ email: normalizedEmail });
        let role = user ? 'admin' : null;

        if (!user) {
            // 2. Check if NGO
            user = await NGO.findOne({ email: normalizedEmail });
            role = user ? 'ngo' : null;
        }

        if (!user) {
            // 3. Check if Donor
            user = await Donor.findOne({ email: normalizedEmail });
            role = user ? 'donor' : null;
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found. Please register first.' });
        }

        generateToken(res, user._id, role);

        res.status(200).json({
            success: true,
            data: user,
            role: role
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        if (req.role === 'admin') {
            const admin = await Admin.findById(req.userId);
            if (!admin) return res.status(401).json({ success: false, message: 'Admin not found' });
            return res.status(200).json({ success: true, data: admin });
        } else if (req.role === 'ngo') {
            const ngo = await NGO.findById(req.userId);
            if (!ngo) return res.status(401).json({ success: false, message: 'NGO not found' });
            return res.status(200).json({ success: true, data: ngo });
        } else if (req.role === 'donor') {
            const donor = await Donor.findById(req.userId);
            if (!donor) return res.status(401).json({ success: false, message: 'Donor not found' });
            return res.status(200).json({ success: true, data: donor });
        } else {
            return res.status(401).json({ success: false, message: 'Invalid session' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.logout = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    });
    res.status(200).json({ success: true, message: 'Logged out' });
};
