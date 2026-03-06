const NGO = require('../models/NGO');

/**
 * Updates an NGO's trust score and manages its status based on the new score.
 * @param {string} ngoId - The ID of the NGO.
 * @param {number} points - The points to add (positive) or subtract (negative).
 * @param {string} reason - The reason for the change.
 */
exports.updateTrustScore = async (ngoId, points, reason) => {
    try {
        const ngo = await NGO.findById(ngoId);
        if (!ngo) throw new Error('NGO not found');

        // Update score with bounds [0, 100]
        let newScore = ngo.trustScore + points;
        if (newScore > 100) newScore = 100;
        if (newScore < 0) newScore = 0;

        ngo.trustScore = newScore;
        ngo.trustHistory.push({ change: points, reason });

        // Logic-based Status Updates
        if (newScore < 40 && ngo.status === 'verified') {
            ngo.status = 'suspended';
            ngo.suspensionReason = `Trust score fell to ${newScore}. Required: ${reason}`;
            console.log(`[ALERT] NGO ${ngo.name} Suspended. Trust Score: ${newScore}`);
        } else if (newScore >= 40 && ngo.status === 'suspended') {
            ngo.status = 'verified';
            ngo.suspensionReason = null;
            console.log(`[ALERT] NGO ${ngo.name} Reinstated. Trust Score: ${newScore}`);
        }

        await ngo.save();
        return ngo;
    } catch (error) {
        console.error('Trust Update Error:', error.message);
        throw error;
    }
};
