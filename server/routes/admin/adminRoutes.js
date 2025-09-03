const express = require('express');
const router = express.Router();
const { createUser } = require('../../controllers/admin/createUserController');
const { getUnblockedUsers, blockUser } = require('../../controllers/admin/blockUserController');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const e = require('express');

router.post('/create-user', verifyToken, authorizeRoles('Admin'), createUser);
router.get('/unblocked', verifyToken, authorizeRoles('Admin'), getUnblockedUsers);
router.post('/block/:id', verifyToken, authorizeRoles('Admin'), blockUser);

module.exports = router;
