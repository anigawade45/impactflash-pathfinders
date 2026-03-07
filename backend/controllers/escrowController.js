const Need = require('../models/Need');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const ImpactStory = require('../models/ImpactStory');
const Donor = require('../models/Donor');
const axios = require('axios');
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
        if (level === 3) {
            milestone.outcomeReport = report;
            const deliveredBeneficiaries = req.body.deliveredBeneficiaries || item.beneficiaries;
            const ActualSpent = req.body.actualSpent || item.fundsRaised;

            // Trigger AI Verification for Outcome Story
            try {
                const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000/api';
                const aiRes = await axios.post(`${AI_ENGINE_URL}/verify-outcome`, {
                    image_url: proofUrl,
                    project_title: item.title,
                    promised_data: {
                        beneficiaries: item.beneficiaries,
                        amount: item.amount || item.targetAmount
                    },
                    delivered_data: {
                        beneficiaries: deliveredBeneficiaries,
                        amount: ActualSpent
                    }
                });

                if (aiRes.data.success) {
                    milestone.aiOutcomeCheck = {
                        status: aiRes.data.status,
                        score: aiRes.data.score,
                        analysis: aiRes.data.visionAnalysis,
                        fidelityMetrics: aiRes.data.fidelityMetrics
                    };
                    console.log(`[AI_OUTCOME] Result stored for ${item.title}: ${aiRes.data.status}`);
                }
            } catch (aiErr) {
                console.warn(`[AI_OUTCOME] Verification skipped/failed: ${aiErr.message}`);
                milestone.aiOutcomeCheck = { status: 'PENDING_MANUAL', analysis: 'AI service unreachable' };
            }
        }

        await item.save();

        res.status(200).json({
            success: true,
            message: `Milestone ${level} proof submitted. ${level === 3 ? 'AI Outcome Analysis triggered.' : ''}`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin: Verify and Release Funds (Instructional Layer)
exports.verifyMilestone = async (req, res) => {
    try {
        const { itemId, itemType, level, action, feedback } = req.body; // action: 'approve' | 'reject'
        const Model = itemType === 'Need' ? Need : Campaign;

        const item = await Model.findById(itemId);
        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        const milestone = item.milestones.find(m => m.level === level);
        if (!milestone) return res.status(404).json({ success: false, message: 'Milestone level not configured for this item' });

        if (action === 'approve') {
            if (milestone.status === 'verified') {
                return res.status(400).json({ success: false, message: 'Milestone already verified and funds released' });
            }

            milestone.status = 'verified';
            milestone.adminFeedback = feedback;
            milestone.releasedAt = new Date();

            // Payout percentages: M1: 40%, M2: 40%, M3: 20%
            const multiplier = level === 1 ? 0.40 : (level === 2 ? 0.40 : 0.20);
            const payoutAmount = Math.floor(item.fundsRaised * multiplier);

            // Intelligence Layer: Instruction to Stripe (Connect/Transfer)
            const instructionId = `SFT_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
            milestone.releaseInstructionId = instructionId;

            item.fundsReleased += payoutAmount;
            item.escrowBalance -= payoutAmount;

            console.log(`[INTELLIGENCE LAYER] Instruction ${instructionId} issued to Stripe: Transfer ₹${payoutAmount} to NGO bank.`);

            // Update Trust Score
            await updateTrustScore(item.ngoId, 5, `Milestone ${level} for ${item.title} verified and funds released.`);

            if (level === 3) {
                item.status = 'completed';
                await updateTrustScore(item.ngoId, 10, `Project "${item.title}" outcome delivery successful.`);

                // Closure of Feedback Loop: Outcome data -> Model retraining
                try {
                    const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000/api';
                    await axios.post(`${AI_ENGINE_URL}/retrain`, {
                        outcome_data: {
                            ngo_id: item.ngoId.toString(),
                            status: 'success',
                            item_id: item._id.toString(),
                            completion_time_days: Math.floor((new Date() - item.createdAt) / (1000 * 60 * 60 * 24)),
                            beneficiaries_actual: item.beneficiaries
                        }
                    });
                    console.log(`[AI_LOOP] Project outcome data sent to AI Protocol for retraining.`);
                } catch (aiErr) {
                    console.warn(`[AI_LOOP] Model update skipped: ${aiErr.message}`);
                }

                // Trigger Impact Story and Notifications (As previously implemented)
                await triggerImpactPostCompletion(item, itemType, milestone);
            }
        } else {
            milestone.status = 'rejected';
            milestone.adminFeedback = feedback;
            await updateTrustScore(item.ngoId, -15, `Milestone ${level} for ${item.title} rejected: ${feedback}`);

            // Closure of Feedback Loop: Outcome data (Failure) -> Model retraining
            if (level === 3) {
                try {
                    const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://127.0.0.1:8000/api';
                    await axios.post(`${AI_ENGINE_URL}/retrain`, {
                        outcome_data: {
                            ngo_id: item.ngoId.toString(),
                            status: 'failure',
                            item_id: item._id.toString(),
                            reason: feedback
                        }
                    });
                } catch (aiErr) {
                    console.warn(`[AI_LOOP] Performance failure data skipped: ${aiErr.message}`);
                }
            }
        }

        await item.save();

        res.status(200).json({
            success: true,
            message: `Instruction ${milestone.releaseInstructionId || 'N/A'} issued. Milestone ${level} ${action === 'approve' ? 'verified' : 'rejected'}.`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Extracted logic for post-completion tasks
async function triggerImpactPostCompletion(item, itemType, milestone) {
    const promisedBen = item.beneficiaries || 0;
    const deliveredBen = item.milestones?.find(m => m.level === 3)?.aiOutcomeCheck?.fidelityMetrics?.beneficiaryMatch ?
        Math.floor(promisedBen * (parseInt(milestone.aiOutcomeCheck.fidelityMetrics.beneficiaryMatch) / 100)) : promisedBen;

    const story = new ImpactStory({
        itemId: item._id,
        itemType: itemType,
        title: item.title,
        ngoId: item.ngoId,
        summary: `${deliveredBen} beneficiaries supported out of ${promisedBen} promised`,
        content: milestone.outcomeReport || 'Project outcomes successfully delivered.',
        photos: item.photos || [],
        financialBreakdown: {
            totalRaised: item.fundsRaised,
            totalSpent: item.fundsReleased
        },
        beneficiaryCount: deliveredBen,
        proofOfWork: milestone.proof,
        aiValidation: milestone.aiOutcomeCheck
    });

    const donations = await Donation.find({ 'items.targetId': item._id, paymentStatus: 'completed' }).populate('donorId', 'name');
    story.donors = donations.map(d => ({
        name: d.donorId.name,
        isAnonymous: d.visibility === 'anonymous'
    }));

    await story.save();

    for (const donation of donations) {
        const itemData = donation.items.find(i => i.targetId.toString() === item._id.toString());
        const donorAmount = itemData ? itemData.amount : 0;

        // Calculate proportional impact
        const totalRaised = item.fundsRaised || 1;
        const donorImpact = Math.floor(deliveredBen * (donorAmount / totalRaised));

        const actualDonor = await Donor.findById(donation.donorId);
        if (actualDonor) {
            actualDonor.notifications.push({
                type: 'outcome',
                message: `Outcome Delivered: Your ₹${donorAmount} helped ${donorImpact} beneficiaries in "${item.title}". See proof!`,
                link: `/impact/${story._id}`
            });
            await actualDonor.save();
        }
    }
}

// Admin: Trigger Manual Overdue Check (or from a CRON job)
exports.checkOverdueMilestones = async (req, res) => {
    try {
        const now = new Date();
        const needs = await Need.find({ 'milestones.status': 'pending', fundStatus: 'active' });
        let actionsTaken = 0;

        for (const item of needs) {
            for (const milestone of item.milestones) {
                if (milestone.status === 'pending' && milestone.targetDate && milestone.targetDate < now) {
                    const daysOverdue = Math.floor((now - milestone.targetDate) / (1000 * 60 * 60 * 24));

                    if (daysOverdue >= 7) {
                        // 7-day grace period expired -> FREEZE
                        item.fundStatus = 'frozen';
                        item.adminFeedback = `AUTO-FROZEN: Milestone ${milestone.level} overdue for 7+ days.`;
                        await updateTrustScore(item.ngoId, -30, `Critical Delay: Milestone ${milestone.level} for ${item.title} not submitted locally.`);
                        console.log(`[ESCROW] Auto-Freezing ${item.title} due to critical delay.`);
                    } else {
                        // Notify/Warn
                        await updateTrustScore(item.ngoId, -2, `Warning: Milestone ${milestone.level} for ${item.title} is overdue.`);
                        console.log(`[ESCROW] Warning issued for ${item.title} (Overdue: ${daysOverdue} days).`);
                    }
                    actionsTaken++;
                }
            }
            await item.save();
        }

        res.status(200).json({ success: true, message: `Checked nodes. Actions taken: ${actionsTaken}` });
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
        await updateTrustScore(item.ngoId, -20, `Manual Emergency Freeze: ${reason}`);

        // Identity-Level Impact (Mock blacklist for Aadhaar-linked individual)
        console.log(`[BLACKWATCH] Aadhaar-linked identity of NGO owner for ${item.title} flagged for blacklist review.`);

        res.status(200).json({
            success: true,
            message: 'Funds frozen immediately. Identity-level blacklist review triggered.',
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

        const need = await Need.findById(itemId);
        const campaign = await Campaign.findById(itemId);
        const item = need || campaign;

        if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

        item.fundStatus = 'refunded';
        item.adminFeedback = `REFUNDED TO DONORS: ${reason}`;
        await item.save();

        const donations = await Donation.find({ 'items.targetId': itemId, paymentStatus: 'completed' });

        for (const donation of donations) {
            donation.paymentStatus = 'failed'; // Mark as refunded locally

            // Logic to initiate Stripe Refund instruction
            const refundRef = `REFUND_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
            console.log(`[INTEL_LAYER] Issuing Refund Instruction ${refundRef} to Stripe for Donor ${donation.donorId}. Reason: NGO Fraud/Failure.`);

            await donation.save();
        }

        res.status(200).json({
            success: true,
            message: `Full refund instructions issued for ${donations.length} donors. NGO item flagged as failed.`
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
