const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/authMiddleware');

const { upload } = require('../utils/cloudinary');

// POST /api/activity/need
router.post('/need', protect, authorize('ngo'), upload.single('documents'), activityController.submitNeed);

// POST /api/activity/campaign
router.post('/campaign', protect, authorize('ngo'), upload.fields([
    { name: 'documents', maxCount: 1 },
    { name: 'photos', maxCount: 5 }
]), activityController.createCampaign);

// GET /api/activity/my-activities
router.get('/my-activities', protect, authorize('ngo'), activityController.getMyActivities);

// GET /api/activity/pending (Admin)
router.get('/pending', protect, authorize('admin'), activityController.getPendingReviews);

// PATCH /api/activity/review/:id (Admin)
router.patch('/review/:id', protect, authorize('admin'), activityController.reviewItem);

// PATCH /api/activity/resubmit/:id
router.patch('/resubmit/:id', protect, authorize('ngo'), upload.fields([
    { name: 'documents', maxCount: 1 },
    { name: 'photos', maxCount: 5 }
]), activityController.resubmitItem);

// GET /api/activity/needs/live
router.get('/needs/live', activityController.getLiveNeeds);

// GET /api/activity/campaigns/live
router.get('/campaigns/live', activityController.getLiveCampaigns);

module.exports = router;
