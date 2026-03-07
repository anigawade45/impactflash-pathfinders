const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    panCard: { type: String }, // Required for tax compliance and fraud check
    causes: [{ type: String }], // e.g., ['Health', 'Education', 'Environment']
    conflicts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NGO' }],
    defaultVisibility: {
        type: String,
        enum: ['public', 'anonymous', 'ngo_only'],
        default: 'anonymous'
    },
    role: { type: String, default: 'donor' },
    streak: { type: Number, default: 0 },
    lastDonationDate: { type: Date },
    notifications: [{
        type: { type: String }, // 'milestone', 'outcome', 'streak_risk'
        message: { type: String },
        link: { type: String },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

donorSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

donorSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Donor', donorSchema);
