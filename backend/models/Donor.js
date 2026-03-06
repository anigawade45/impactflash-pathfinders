const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const donorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    panCard: { type: String }, // Required for 80G and fraud check
    causes: [{ type: String }], // e.g., ['Health', 'Education', 'Environment']
    conflicts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'NGO' }],
    defaultVisibility: {
        type: String,
        enum: ['public', 'anonymous', 'ngo_only'],
        default: 'anonymous'
    },
    role: { type: String, default: 'donor' }
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