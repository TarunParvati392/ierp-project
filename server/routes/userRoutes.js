const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { theme, updateProfileImage } = require('../controllers/userController');

router.patch('/theme', authMiddleware, theme);
router.post('/profile-image', authMiddleware, upload.single('profileImage'), updateProfileImage);

module.exports = router;    