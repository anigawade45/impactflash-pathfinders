const Need = require('../models/Need');
const Campaign = require('../models/Campaign');
const NGO = require('../models/NGO');
const AuditLog = require('../models/AuditLog');
const axios = require('axios');

const AI_ENGINE_URL = 'http://127.0.0.1:8000/api/score';

const determineStatus = (score, fraudFlag) => {
    // 1. Score < 50 OR High Fraud -> Auto Reject
    if (fraudFlag || score < 50) {
        return 'rejected';
    }

    // 2. Score >= 85 + Low Fraud -> Auto Approve
    if (score >= 85) {
        return 'live';
    }

    // 3. Score 50-84 OR Medium Risk -> Admin Queue
    return 'in_review';
};

exports.submitNeed = async (req, res) => {
    try {
        let { ngoId, title, urgency, category, amount, beneficiaries, deadline } = req.body;

        // Handle multipart data
        const documents = req.file ? [req.file.path] : [];

        // 0. Check NGO Trust Status
        const ngo = await NGO.findById(ngoId);
        if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });
        if (ngo.status !== 'verified') {
            return res.status(403).json({
                success: false,
                message: `Verification Pending: Your NGO must be verified by an administrator before creating needs or campaigns. Current Status: ${ngo.status.toUpperCase()}`
            });
        }

        // 1. Get AI Score with 22-attribute protocol simulation
        const aiResponse = await axios.post(AI_ENGINE_URL, {
            type: 'need',
            title,
            urgency,
            category,
            amount,
            beneficiaries,
            ngo_trust: ngo.trustScore, // Pass trust score for contextual anomaly layer
            image_url: documents[0] || null
        });

        const {
            score,
            verdict,
            why_high,
            why_not_higher,
            fraud_status,
            one_flag,
            suggestion,
            fraudFlag,
            visionAuthentic,
            aiRecommendationPoints,
            shap_summary
        } = aiResponse.data;

        // 2. Determine workflow status with strict AI thresholds
        let finalStatus = determineStatus(score, fraudFlag);

        // Layer 4: 5% Random Spot Check (Overrides auto-approve)
        const isSpotCheck = Math.random() < 0.05;

        // 3. Save Need
        const newNeed = new Need({
            ngoId,
            title,
            urgency,
            category,
            amount,
            beneficiaries,
            deadline,
            documents,
            aiScore: score,
            aiVerdict: verdict,
            aiWhyHigh: why_high,
            aiWhyNotHigher: why_not_higher,
            aiFraudStatus: fraud_status,
            aiSuggestion: suggestion,
            aiRecommendationPoints,
            aiShapSummary: shap_summary,
            explanation: `${verdict}: ${why_high}. Flags: ${one_flag}`,
            fraudFlag,
            visionAuthentic: !!visionAuthentic,
            status: isSpotCheck && finalStatus === 'live' ? 'in_review' : finalStatus,
            isSpotCheck,
            milestones: [
                { level: 1, title: 'Initiation', percentage: 40, status: 'pending' },
                { level: 2, title: 'Mid-point', percentage: 40, status: 'pending' },
                { level: 3, title: 'Final Report', percentage: 20, status: 'pending' }
            ]
        });

        await newNeed.save();

        // Increment Impact only if it goes LIVE immediately (AI Auto-Approve)
        if (newNeed.status === 'live') {
            let impactIncrement = 1.0;
            if (newNeed.documents?.length > 0 && visionAuthentic !== false) {
                impactIncrement = 1.5;
            }
            await NGO.findByIdAndUpdate(ngoId, { $inc: { impactScore: impactIncrement } });
        }

        res.status(201).json({
            success: true,
            message: `Need submitted. AI Result: ${verdict}`,
            data: newNeed
        });

    } catch (error) {
        console.error('Error submitting need:', error.message);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.createCampaign = async (req, res) => {
    try {
        const { ngoId, title, story, targetAmount, category } = req.body;

        // Handle multipart files
        const documents = req.files?.documents?.map(file => file.path) || [];
        const photos = req.files?.photos?.map(file => file.path) || [];

        // 0. Check NGO Trust Status
        const ngo = await NGO.findById(ngoId);
        if (!ngo) return res.status(404).json({ success: false, message: 'NGO not found' });
        if (ngo.status !== 'verified') {
            return res.status(403).json({
                success: false,
                message: `Verification Pending: Your NGO must be verified by an administrator before creating fundraising campaigns. Current Status: ${ngo.status.toUpperCase()}`
            });
        }

        // Default 15-day deadline for 'Immediate Fund Raising'
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 15);

        // 1. Get AI Score
        const aiResponse = await axios.post(AI_ENGINE_URL, {
            type: 'campaign',
            title,
            story,
            category: category || 'Social',
            targetAmount,
            ngo_trust: ngo.trustScore,
            image_url: photos[0] || documents[0] || null
        });

        const {
            score,
            verdict,
            why_high,
            why_not_higher,
            fraud_status,
            one_flag,
            suggestion,
            fraudFlag,
            aiRecommendationPoints,
            shap_summary
        } = aiResponse.data;

        // 2. Determine workflow status with strict AI thresholds
        let finalStatus = determineStatus(score, fraudFlag);

        // Layer 4: 5% Random Spot Check
        const isSpotCheck = Math.random() < 0.05;

        // 3. Save Campaign
        const newCampaign = new Campaign({
            ngoId,
            title,
            story,
            deadline,
            targetAmount,
            category: category || 'Social',
            photos,
            documents,
            aiScore: score,
            aiVerdict: verdict,
            aiWhyHigh: why_high,
            aiWhyNotHigher: why_not_higher,
            aiFraudStatus: fraud_status,
            aiOneFlag: one_flag,
            aiSuggestion: suggestion,
            aiRecommendationPoints,
            aiShapSummary: shap_summary,
            explanation: `${verdict}: ${why_high}. Flags: ${one_flag}`,
            fraudFlag,
            status: isSpotCheck && finalStatus === 'live' ? 'in_review' : finalStatus,
            isSpotCheck,
            milestones: [
                { level: 1, title: 'Initiation', percentage: 40, status: 'pending' },
                { level: 2, title: 'Mid-point', percentage: 40, status: 'pending' },
                { level: 3, title: 'Final Report', percentage: 20, status: 'pending' }
            ]
        });

        await newCampaign.save();

        // Increment Impact only if LIVE (AI Auto-Approve)
        if (newCampaign.status === 'live') {
            await NGO.findByIdAndUpdate(ngoId, { $inc: { impactScore: 1.0 } });
        }

        res.status(201).json({
            success: true,
            message: `Campaign created. AI Result: ${verdict}`,
            data: newCampaign
        });

    } catch (error) {
        console.error('Error creating campaign:', error.message);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.getPendingReviews = async (req, res) => {
    try {
        const pendingNeeds = await Need.find({ status: 'in_review' }).populate('ngoId', 'name email');
        const pendingCampaigns = await Campaign.find({ status: 'in_review' }).populate('ngoId', 'name email');
        const pendingNgos = await NGO.find({ status: 'in_review' });

        const pendingMilestoneNeeds = await Need.find({ 'milestones.status': 'submitted' }).populate('ngoId', 'name email');
        const pendingMilestoneCampaigns = await Campaign.find({ 'milestones.status': 'submitted' }).populate('ngoId', 'name email');

        res.status(200).json({
            success: true,
            needs: pendingNeeds,
            campaigns: pendingCampaigns,
            ngos: pendingNgos,
            milestoneNeeds: pendingMilestoneNeeds,
            milestoneCampaigns: pendingMilestoneCampaigns
        });
    } catch (error) {
        console.error('Error fetching pending reviews:', error.message);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

exports.reviewItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, action } = req.body;

        let Model;
        let status;

        if (type === 'need') {
            Model = Need;
            status = action === 'approve' ? 'live' : 'rejected';
        } else if (type === 'campaign') {
            Model = Campaign;
            status = action === 'approve' ? 'live' : 'rejected';
        } else if (type === 'ngo') {
            Model = NGO;
            status = action === 'approve' ? 'verified' : 'rejected';
        }

        let item;
        if (type === 'ngo') {
            item = await Model.findById(id);
        } else {
            item = await Model.findById(id).populate('ngoId');
        }

        if (!item) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const targetNgoId = type === 'ngo' ? item._id : item.ngoId?._id || item.ngoId;

        // Layer 5: Rotation Policy (No single admin always reviews same NGO)
        if (type !== 'ngo') {
            const ngo = await NGO.findById(targetNgoId);
            if (ngo && ngo.lastReviewedBy && ngo.lastReviewedBy.toString() === req.userId.toString()) {
                return res.status(403).json({
                    success: false,
                    message: 'Fraud Prevention: A different admin must review this NGO (Rotation Policy).'
                });
            }
        }

        // Layer 5: Dual Admin for > 1 Lakh
        const amount = item.amount || item.targetAmount;
        if (type !== 'ngo' && amount >= 100000 && action === 'approve') {
            const alreadyApprovedBy = item.approvals.some(a => a.adminId.toString() === req.userId.toString());
            if (alreadyApprovedBy) {
                return res.status(400).json({ success: false, message: 'You have already approved this item. Waiting for secondary admin.' });
            }

            item.approvals.push({ adminId: req.userId });

            if (item.approvals.length < 2) {
                item.status = 'in_review';
                item.explanation = 'Awaiting secondary administrative approval (Layer 5: > ₹1L).';
                await item.save();
                return res.status(200).json({ success: true, message: 'Primary approval recorded. Awaiting secondary admin.' });
            }
        }

        // Final Approval/Rejection
        item.status = status;
        item.lastReviewedBy = req.userId;
        await item.save();

        // Update NGO lastReviewedBy and set Initial Impact Score on verification
        if (targetNgoId) {
            const updateData = { lastReviewedBy: req.userId };
            if (type === 'ngo' && action === 'approve') {
                updateData.impactScore = 50;
            }

            // Dynamic Impact Score increment on Project Approval
            if (action === 'approve') {
                if (type === 'need') {
                    const impactBonus = (item.documents?.length > 0 && item.visionAuthentic !== false) ? 1.5 : 1.0;
                    updateData.$inc = { impactScore: impactBonus };
                } else if (type === 'campaign') {
                    updateData.$inc = { impactScore: 1.0 };
                }
            }

            await NGO.findByIdAndUpdate(targetNgoId, updateData);
        }

        // Layer 5: Public Audit Log
        await AuditLog.create({
            adminId: req.userId,
            action: `${action}_${type}`,
            targetId: item._id,
            targetType: type === 'need' ? 'Need' : (type === 'campaign' ? 'Campaign' : 'NGO'),
            details: { status: item.status, amount },
            ipAddress: req.ip
        });

        res.status(200).json({
            success: true,
            message: `Item successfully ${status}.`,
            data: item
        });
    } catch (error) {
        console.error('Error reviewing item:', error.message);
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};
exports.getLiveNeeds = async (req, res) => {
    try {
        const needs = await Need.find({ status: 'live' }).populate('ngoId', 'name');
        res.status(200).json({ success: true, data: needs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getLiveCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.find({ status: 'live' }).populate('ngoId', 'name');
        res.status(200).json({ success: true, data: campaigns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getMyActivities = async (req, res) => {
    try {
        const needs = await Need.find({ ngoId: req.userId }).sort({ createdAt: -1 });
        const campaigns = await Campaign.find({ ngoId: req.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, needs, campaigns });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
