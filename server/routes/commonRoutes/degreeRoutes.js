const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { degree, specialization, getBatches, getAllBatches } = require('../../controllers/common/degreeController');

router.get('/', verifyToken, authorizeRoles('Academic Manager', 'Admin'), degree);
router.get('/specializations/:degreeId', verifyToken, authorizeRoles('Academic Manager', 'Admin'), specialization);
router.get('/batches/:degreeId/:specializationId', verifyToken, authorizeRoles('Academic Manager', 'Admin'), getBatches);
router.get('/all-batches', verifyToken, authorizeRoles('Academic Manager', 'Admin'), getAllBatches);


module.exports = router;