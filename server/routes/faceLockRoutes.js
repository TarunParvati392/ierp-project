const express = require('express');
const router = express.Router();
const authMiddleware  = require('../middleware/auth');
const { updateFaceLock } = require('../controllers/faceLockController');

router.post('/update-facelock', authMiddleware, updateFaceLock);

module.exports = router;
