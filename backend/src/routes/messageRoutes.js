const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const logActivity = require('../middleware/logActivity');
const {
  getAllMessages,
  getMessage,
  updateMessageStatus,
  deleteMessage,
  getMessageStats,
  createMessage
} = require('../controllers/messageController');

// معظم المسارات تتطلب مصادقة وأدوار محددة
router.use(authenticateToken);

// جلب جميع الرسائل (للمدير فقط)
router.get('/', requireRole(['admin', 'system_admin']), getAllMessages);

// جلب رسالة واحدة
router.get('/:id', requireRole(['admin', 'system_admin']), getMessage);

// تحديث حالة الرسالة
router.put('/:id', logActivity('update_message_status', 'admin', (req) => `Message status updated for ID ${req.params.id}`), updateMessageStatus);

// حذف رسالة
router.delete('/:id', requireRole(['admin', 'system_admin']), logActivity('delete_message', 'admin', (req) => `Message deleted: ID ${req.params.id}`), deleteMessage);

// إحصائيات الرسائل
router.get('/stats/overview', requireRole(['admin', 'system_admin']), getMessageStats);

// إنشاء رسالة جديدة (من نموذج الاتصال)
// This is handled by contactRoutes.js now
// router.post('/', createMessage);

module.exports = router;
