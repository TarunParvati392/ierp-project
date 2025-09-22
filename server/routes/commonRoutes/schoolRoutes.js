const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { getSchools, getDepartmentsBySchool } = require('../../controllers/common/schoolController');

router.get('/', verifyToken, authorizeRoles('Academic Manager', 'Schedule Manager'), getSchools);
router.get('/departments/:schoolId', verifyToken, authorizeRoles('Academic Manager', 'Schedule Manager'), getDepartmentsBySchool);

module.exports = router;
