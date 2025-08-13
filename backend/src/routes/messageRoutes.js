import express from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';
import {
  getAllMessages,
  getMessage,
  updateMessageStatus,
  deleteMessage,
  getMessageStats
} from '../controllers/messageController.js';

const router = express.Router();

// معظم المسارات تتطلب مصادقة وأدوار محددة
router.use(authenticateToken);

// جلب جميع الرسائل (للمدير فقط)
router.get('/', requireRole(['admin', 'system_admin']), getAllMessages);

// إحصائيات الرسائل - يجب أن يكون قبل /:id
router.get('/stats/overview', requireRole(['admin', 'system_admin']), getMessageStats);

// جلب رسالة واحدة
router.get('/:id', requireRole(['admin', 'system_admin']), getMessage);

// تحديث حالة الرسالة
router.put('/:id', logActivity('update_message_status', 'admin', (req) => `Message status updated for ID ${req.params.id}`), updateMessageStatus);

// حذف رسالة
router.delete('/:id', requireRole(['admin', 'system_admin']), logActivity('delete_message', 'admin', (req) => `Message deleted: ID ${req.params.id}`), deleteMessage);

// إنشاء رسالة جديدة (من نموذج الاتصال)
// This is handled by contactRoutes.js now
// router.post('/', createMessage);

export default router;
