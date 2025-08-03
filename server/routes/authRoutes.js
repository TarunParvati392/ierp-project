const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword, verifyToken } = require('../controllers/authController');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword); 
router.post('/verify-token/:token', verifyToken);

module.exports = router;

