const express = require('express');
const router = express.Router();
const { createUser } = require('../../controllers/admin/createUserController');
const { getUnblockedUsers, blockUser } = require('../../controllers/admin/blockUserController');
const { getBlockedUsers, Unblock } = require('../../controllers/admin/unBlock');
const { getAllUsers, deleteUser } = require('../../controllers/admin/deleteUser');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const e = require('express');

router.post('/create-user', verifyToken, authorizeRoles('Admin'), createUser);
router.get('/unblocked', verifyToken, authorizeRoles('Admin'), getUnblockedUsers);
router.post('/block/:id', verifyToken, authorizeRoles('Admin'), blockUser);
router.get('/blocked', verifyToken, authorizeRoles('Admin'), getBlockedUsers);
router.put('/unblock/:id', verifyToken, authorizeRoles('Admin'), Unblock);
router.get('/all-users', verifyToken, authorizeRoles('Admin'), getAllUsers);
router.delete('/delete/:id', verifyToken, authorizeRoles('Admin'), deleteUser);

module.exports = router;
