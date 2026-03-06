const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    panCard: { type: String }, // Required for 80G and fraud check
    causes: [{ type: String }], // e.g., ['Health', 'Education', 'Environment']
    conflicts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NGO' }], // NGOs they are connected to
    role: { type: String, default: 'donor' }
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema);
