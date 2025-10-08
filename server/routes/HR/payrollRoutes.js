const express = require('express');
const router = express.Router();
const { verifyToken, authorizeRoles } = require('../../middleware/auth');
const { sendPayrollMails } = require('../../controllers/HR/payrollController');

router.post('/send-mails', verifyToken, authorizeRoles('HR'), sendPayrollMails);

module.exports = router;
