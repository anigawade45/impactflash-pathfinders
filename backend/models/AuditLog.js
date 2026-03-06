const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    action: { type: String, required: true }, // e.g., "approve_need", "reject_ngo", "freeze_funds"
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    targetType: { type: String, enum: ['Need', 'Campaign', 'NGO', 'Donation'], required: true },
    details: { type: Object },
    ipAddress: { type: String },
    userAgent: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
