const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// PUBLIC TRANSPARENCY LEDGER - GLOBAL ROUTES
router.get('/ngos', publicController.getPublicNgos);
router.get('/needs', publicController.getPublicNeeds);
router.get('/campaigns', publicController.getPublicCampaigns);
router.get('/audit-logs', publicController.getPublicAuditLogs);
router.get('/stats', publicController.getPlatformStats);
router.get('/impact-stories', publicController.getPublicStories);

module.exports = router;
