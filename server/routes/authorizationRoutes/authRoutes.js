const express = require('express');
const router = express.Router();

const { login, forgotPassword, resetPassword, 
    verifyToken, saveFace, faceLogin } = require('../../controllers/authorization/authController');

router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword); 
router.post('/verify-token/:token', verifyToken);
router.post('/save-face', saveFace);
router.post('/face-login', faceLogin);




module.exports = router;

