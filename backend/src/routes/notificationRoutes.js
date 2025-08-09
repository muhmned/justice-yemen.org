const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsRead, 
  createNotification 
} = require('../controllers/notificationController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const logActivity = require('../middleware/logActivity');

// جلب الإشعارات
router.get('/notifications', authenticateToken, getNotifications);

// تحديث حالة الإشعار كمقروء
router.put('/notifications/:notificationId/read', authenticateToken, logActivity('mark_notification_read', 'user', (req) => `Notification marked as read: ID ${req.params.notificationId}`), markAsRead);

// إنشاء إشعار جديد
router.post('/notifications', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('create_notification', 'admin', (req) => `Notification created: ${req.body.message}`), createNotification);

module.exports = router;
