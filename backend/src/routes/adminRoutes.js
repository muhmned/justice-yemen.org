const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { getActivityLog } = require('../controllers/activityLogController');

const router = express.Router();

const verifyAdmin = [authenticateToken, requireRole(['admin', 'system_admin'])];

router.get('/activity-log', verifyAdmin, getActivityLog);

router.get('/me', verifyAdmin, (req, res) => {
  res.json({
    name: req.user.username,
    role: 'مدير النظام'
  });
});

module.exports = router;
