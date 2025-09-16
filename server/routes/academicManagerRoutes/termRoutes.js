const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { createTerm, assignFacultyToSubject, getTermWithAssignments, getTermsByBatch } = require('../../controllers/academicmanager/termController');

router.post("/create", verifyToken, authorizeRoles('Academic Manager'), createTerm);
router.post("/:termId/subjects/:subjectId/faculty", verifyToken, authorizeRoles('Academic Manager'), assignFacultyToSubject);
router.get("/:termId", verifyToken, authorizeRoles('Academic Manager'), getTermWithAssignments);
router.get("/by-batch/:batchId", verifyToken, authorizeRoles('Academic Manager'), getTermsByBatch);

module.exports = router;