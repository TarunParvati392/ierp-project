const express = require("express");
const router = express.Router();
const schedulerController = require("../../controllers/scheduleManager/scheduleController");
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const auth = [verifyToken, authorizeRoles('Schedule Manager', 'Academic Manager', 'Admin')];
// Generate preview (not saved)
router.post("/generate", auth, schedulerController.generateTimetable);

// Publish timetable
//router.post("/publish", auth, schedulerController.publishTimetable);

// Get latest timetable for a batch
//router.get("/latest", auth, schedulerController.getLatestTimetable);

// Get faculty timetable
//router.get("/faculty/:facultyId", auth, schedulerController.getFacultyTimetable);

// Get section timetable
//router.get("/section/:sectionId", auth, schedulerController.getSectionTimetable);

module.exports = router;
