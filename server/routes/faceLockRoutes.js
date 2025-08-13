const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middleware/auth');
const { updateFaceLock, faceLoginStart, faceLoginVerify } = require('../controllers/faceLockController');

router.post('/update-facelock', authMiddleware, updateFaceLock);
router.post('/face-login/start', faceLoginStart);
router.post('/face-login/verify', faceLoginVerify);

module.exports = router;
