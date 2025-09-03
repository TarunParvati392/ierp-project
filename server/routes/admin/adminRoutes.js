const express = require('express');
const router = express.Router();
const { createUser } = require('../../controllers/admin/createUserController');
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const e = require('express');

router.post('/create-user', verifyToken, authorizeRoles('Admin'), createUser);

module.exports = router;
