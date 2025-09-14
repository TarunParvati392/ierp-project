const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { createAcademicYear, getAcademicYears } = require('../../controllers/academicmanager/academiController');
    
router.post("/create", verifyToken, authorizeRoles('Academic Manager'), createAcademicYear);
router.get("/", verifyToken, authorizeRoles('Academic Manager'), getAcademicYears);

module.exports = router;