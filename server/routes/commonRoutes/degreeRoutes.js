const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { degree, specialization } = require('../../controllers/common/degreeController');

router.get('/', verifyToken, authorizeRoles('Academic Manager'), degree);
router.get('/specializations/:degreeId', verifyToken, authorizeRoles('Academic Manager'), specialization);

module.exports = router;