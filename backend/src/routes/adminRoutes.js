import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getActivityLog } from '../controllers/activityLogController.js';

const router = express.Router();

const verifyAdmin = [authenticateToken, requireRole(['admin', 'system_admin'])];

router.get('/activity-log', verifyAdmin, getActivityLog);

router.get('/me', verifyAdmin, (req, res) => {
  res.json({
    name: req.user.username,
    role: 'مدير النظام'
  });
});

export default router;
