const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword, verifyToken, saveFace } = require('../controllers/authController');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword); 
router.post('/verify-token/:token', verifyToken);
router.post('/save-face', saveFace);


module.exports = router;

