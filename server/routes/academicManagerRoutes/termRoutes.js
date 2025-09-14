const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { createTerm } = require('../../controllers/academicmanager/termController');

router.post("/create", verifyToken, authorizeRoles('Academic Manager'), createTerm);

module.exports = router;