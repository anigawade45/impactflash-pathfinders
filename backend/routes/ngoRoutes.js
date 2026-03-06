const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngoController');
const { upload } = require('../utils/cloudinary');

// POST /api/ngos/register (Multipart Form Data)
router.post('/register', upload.single('registrationCertificate'), ngoController.registerNgo);

// POST /api/ngos/verify-pan
router.post('/verify-pan', ngoController.verifyPan);

// GET /api/ngos/:id
router.get('/:id', ngoController.getNgoById);

module.exports = router;
