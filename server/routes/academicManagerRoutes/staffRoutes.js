const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { getAllDeans, getAllHODs, getAllFaculty,
    assignDean, getDeanBySchool, deAssignDean, assignHOD,
    getHODbyDepartment, deAssignHOD
 } = require('../../controllers/academicmanager/staffController');

router.get('/deans', verifyToken, authorizeRoles('Academic Manager'), getAllDeans);
router.get('/hods', verifyToken, authorizeRoles('Academic Manager'), getAllHODs);
router.get('/faculty', verifyToken, authorizeRoles('Academic Manager'), getAllFaculty);
router.post('/assign-dean', verifyToken, authorizeRoles('Academic Manager'), assignDean);
router.get('/dean-by-school/:schoolId', verifyToken, authorizeRoles('Academic Manager'), getDeanBySchool);
router.post('/deassign-dean', verifyToken, authorizeRoles('Academic Manager'), deAssignDean);
router.post('/assign-hod', verifyToken, authorizeRoles('Academic Manager'), assignHOD);
router.get('/hod/:departmentId', verifyToken, authorizeRoles('Academic Manager'), getHODbyDepartment);
router.post('/deassign-hod', verifyToken, authorizeRoles('Academic Manager'), deAssignHOD);

module.exports = router;