import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';
import {
  getNotifications,
  createNotification,
  markAsRead
} from '../controllers/notificationController.js';

const router = express.Router();

// جلب الإشعارات
router.get('/', authenticateToken, getNotifications);

// تحديث حالة الإشعار كمقروء
router.put('/:notificationId/read', authenticateToken, logActivity('mark_notification_read', 'user', (req) => `Notification marked as read: ID ${req.params.notificationId}`), markAsRead);

// إنشاء إشعار جديد
router.post('/', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('create_notification', 'admin', (req) => `Notification created: ${req.body.message}`), createNotification);

export default router;
