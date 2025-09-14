const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { createSection, getSections, getBatchDetails } = require('../../controllers/academicmanager/sectionsController');

router.post("/create", verifyToken, authorizeRoles('Academic Manager'), createSection);
router.get("/", verifyToken, authorizeRoles('Academic Manager'), getSections);
router.get("/batch-details/:batchId", verifyToken, authorizeRoles('Academic Manager'), getBatchDetails);

module.exports = router;