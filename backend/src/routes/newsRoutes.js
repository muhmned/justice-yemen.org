import express from 'express';
import multer from 'multer';
import { authenticateToken, checkPermission, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  getNewsById,
  searchNews
} from '../controllers/newsController.js';

const router = express.Router();

// تكوين multer للذاكرة
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  },
  fileFilter: function (req, file, cb) {
    // التحقق من نوع الملف
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('يسمح فقط بملفات الصور'), false);
    }
  }
});

// Routes للأخبار - ترتيب المسارات مهم!
router.get('/', getAllNews); // جلب جميع الأخبار (عام)
router.get('/search', searchNews); // البحث في الأخبار (عام) - يجب أن يكون قبل /:id
router.get('/:id', getNewsById); // جلب خبر محدد (عام)

// Routes تتطلب مصادقة
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('image'), logActivity('create_news', 'content', (req) => `News created: ${req.body.title}`), createNews); // إضافة خبر جديد
router.put('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('image'), logActivity('update_news', 'content', (req) => `News updated: ${req.body.title}`), updateNews); // تحديث خبر
router.delete('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('delete_news', 'content', (req) => `News deleted: ID ${req.params.id}`), deleteNews); // حذف خبر

export default router;
