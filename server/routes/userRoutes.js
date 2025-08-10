const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { theme, updateProfileImage, updatePassword } = require('../controllers/userController');

router.patch('/theme', authMiddleware, theme);
router.post('/profile-image', authMiddleware, upload.single('profileImage'), updateProfileImage);
router.put('/update-password', authMiddleware, updatePassword);

module.exports = router;    