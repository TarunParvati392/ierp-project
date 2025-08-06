const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { theme } = require('../controllers/userController');

router.patch('/theme', authMiddleware, theme);

module.exports = router;