const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { generateTimetable, publishTimetable } = require('../../controllers/scheduleManager/scheduleController');

router.post("/generate", verifyToken, authorizeRoles('Schedule Manager'), generateTimetable);
router.post("/publish", verifyToken, authorizeRoles('Schedule Manager'), publishTimetable);
module.exports = router;
