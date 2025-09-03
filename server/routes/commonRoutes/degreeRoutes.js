const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { degree, specialization, getBatches } = require('../../controllers/common/degreeController');

router.get('/', verifyToken, authorizeRoles('Academic Manager', 'Admin'), degree);
router.get('/specializations/:degreeId', verifyToken, authorizeRoles('Academic Manager', 'Admin'), specialization);
router.get('/batches/:degreeId/:specializationId', verifyToken, authorizeRoles('Academic Manager', 'Admin'), getBatches);

module.exports = router;