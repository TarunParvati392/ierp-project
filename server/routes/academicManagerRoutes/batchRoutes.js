const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { createBatch } = require('../../controllers/academicmanager/batchController');

router.post('/', verifyToken, authorizeRoles('Academic Manager'), createBatch);

module.exports = router;