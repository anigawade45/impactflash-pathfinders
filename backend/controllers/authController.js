const NGO = require('../models/NGO');
const Donor = require('../models/Donor');
const Admin = require('../models/Admin');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const normalizedEmail = email.trim().toLowerCase();

        let user;
        if (role === 'admin') {
            user = await Admin.findOne({ email: normalizedEmail });
        } else if (role === 'ngo') {
            user = await NGO.findOne({ email: normalizedEmail });
        } else if (role === 'donor') {
            user = await Donor.findOne({ email: normalizedEmail });
        } else {
            return res.status(400).json({ success: false, message: 'Invalid role specified.' });
        }

        if (!user) {
            return res.status(404).json({ success: false, message: `No ${role} account found with this email.` });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        generateToken(req, res, user._id, role);

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
