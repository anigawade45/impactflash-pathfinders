const Need = require('../models/Need');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const ImpactStory = require('../models/ImpactStory');
const Donor = require('../models/Donor');
const { updateTrustScore } = require('../utils/trustCalculator');

// NGO: Submit proof for a milestone
exports.submitMilestoneProof = async (req, res) => {
    try {
        const { itemId, itemType, level, proofUrl, report } = req.body;
        const Model = itemType === 'Need' ? Need : Campaign;

        const item = await Model.findById(itemId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        // Security: Check if NGO owns this item
        if (item.ngoId.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Unauthorized submission' });
        }

        const milestone = item.milestones.find(m => m.level === level);
        if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not configured' });

        milestone.status = 'submitted';
        milestone.proof = proofUrl;
        if (level === 3) milestone.outcomeReport = report;

        await item.save();

        res.status(200).json({ success: true, message: `Milestone ${level} proof submitted for verification.` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Verify and Release Funds
exports.verifyMilestone = async (req, res) => {
    try {
        const { itemId, itemType, level, action, feedback } = req.body; // action: 'approve' | 'reject'
        const Model = itemType === 'Need' ? Need : Campaign;

        const item = await Model.findById(itemId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        const milestone = item.milestones.find(m => m.level === level);
        if (!milestone) return res.status(404).json({ success: false, message: 'Milestone not found' });

        if (action === 'approve') {
            milestone.status = 'verified';
            milestone.adminFeedback = feedback;
            milestone.releasedAt = new Date();

            const releaseAmount = (item.fundsRaised * milestone.percentage) / 100;
            console.log(`[ESCROW] Releasing ₹${releaseAmount} to NGO bank for ${item.title} (Level ${level})`);

            // Update Trust Score
            await updateTrustScore(item.ngoId, 5, `Milestone ${level} for ${item.title} verified on time.`);

            if (level === 3) {
                item.status = 'completed';
                await updateTrustScore(item.ngoId, 10, `Project "${item.title}" successfully completed and outcome delivered.`);

                // 1. Create Impact Story
                const story = new ImpactStory({
                    itemId: item._id,
                    itemType: itemType,
                    title: item.title,
                    ngoId: item.ngoId,
                    summary: `${item.beneficiaries} beneficiaries supported through ${item.title}`,
                    content: milestone.outcomeReport,
                    photos: item.photos || [],
                    financialBreakdown: {
                        totalRaised: item.fundsRaised,
                        totalSpent: item.fundsRaised
                    },
                    beneficiaryCount: item.beneficiaries,
                    proofOfWork: milestone.proof
                });

                // 2. Aggregate Donor Impact (Mock)
                const donations = await Donation.find({ 'items.targetId': item._id, paymentStatus: 'completed' }).populate('donorId', 'name');

                story.donors = donations.map(d => ({
                    name: d.donorId.name,
                    isAnonymous: d.visibility === 'anonymous'
                }));

                await story.save();

                // 3. Trigger "Push Notifications" (Mock)
                for (const donation of donations) {
                    const donorAmount = donation.items.find(i => i.targetId.toString() === item._id.toString()).amount;
                    console.log(`[NOTIFICATION] To Donor ${donation.donorId.name}: Your ₹${donorAmount} helped support ${item.beneficiaries} people! See the story: /impact/${story._id}`);
                }
            }
        } else {
            milestone.status = 'rejected';
            milestone.adminFeedback = feedback;
            await updateTrustScore(item.ngoId, -10, `Milestone ${level} for ${item.title} rejected: ${feedback}`);
        }

        await item.save();

        res.status(200).json({
            success: true,
            message: `Milestone ${level} ${action === 'approve' ? 'verified and funds triggered' : 'rejected'}.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Freeze Funds (Emergency)
exports.freezeEscrow = async (req, res) => {
    try {
        const { itemId, itemType, reason } = req.body;
        const Model = itemType === 'Need' ? Need : Campaign;

        const item = await Model.findByIdAndUpdate(itemId, {
            fundStatus: 'frozen',
            adminFeedback: `FROZEN: ${reason}`
        }, { new: true });

        // Update Trust Score
        await updateTrustScore(item.ngoId, -20, `Emergency Freeze: ${reason}`);

        // Logic to notify donors would go here
        console.log(`[EMERGENCY] Funds frozen for ${item.title}. Reason: ${reason}`);

        res.status(200).json({
            success: true,
            message: 'Funds frozen. Investigation triggered.',
            data: item
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Process Refunds for a failed/frozen item
exports.processRefunds = async (req, res) => {
    try {
        const { itemId, reason } = req.body;

        // 1. Mark the item as refunded
        const need = await Need.findById(itemId);
        const campaign = await Campaign.findById(itemId);
        const item = need || campaign;

        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        item.fundStatus = 'refunded';
        item.adminFeedback = `REFUNDED: ${reason}`;
        await item.save();

        // 2. Find all successful donations containing this item
        const donations = await Donation.find({
            'items.targetId': itemId,
            paymentStatus: 'completed'
        });

        // 3. Update each donation (In a real app, this would trigger Razorpay Refund API)
        for (const donation of donations) {
            donation.paymentStatus = 'failed'; // Or 'refunded' if added to enum
            // donation.refundId = 'ref_mock_123';
            await donation.save();
            console.log(`[REFUND] Triggered refund for Donation ${donation._id} (User: ${donation.donorId})`);
        }

        res.status(200).json({
            success: true,
            message: `Refund process initiated for ${donations.length} donors.`,
            donorsAffected: donations.length
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
