const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
const { theme, updateProfileImage, updatePassword } = require('../../controllers/common/userController');

router.patch('/theme', verifyToken, theme);
router.post('/profile-image', verifyToken, upload.single('profileImage'), updateProfileImage);
router.put('/update-password', verifyToken, updatePassword);

module.exports = router;    