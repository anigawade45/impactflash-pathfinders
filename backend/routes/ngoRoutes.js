const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { upload } = require('../utils/cloudinary');
const { protect } = require('../middleware/authMiddleware');

// POST /api/ngos/register (Multipart Form Data)
router.post('/register', upload.single('registrationCertificate'), ngoController.registerNgo);

// PATCH /api/ngos/resubmit (Protected for NGOs to correct rejected apps)
router.patch('/resubmit', protect, upload.single('registrationCertificate'), ngoController.resubmitNgo);

// POST /api/ngos/verify-pan
router.post('/verify-pan', ngoController.verifyPan);

// POST /api/ngos/verify-aadhaar
router.post('/verify-aadhaar', ngoController.verifyAadhaar);

// GET /api/ngos/:id
router.get('/:id', ngoController.getNgoById);

module.exports = router;
