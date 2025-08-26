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
  fileFilter: (req, file, cb) => {
    console.log('معالجة ملف خبر:', file.originalname, 'نوع:', file.mimetype);
    
    // التحقق من نوع الملف
    if (file.mimetype.startsWith('image/')) {
      console.log('تم قبول الملف:', file.originalname);
      cb(null, true);
    } else {
      console.log('تم رفض الملف (نوع غير مدعوم):', file.originalname);
      cb(new Error('يسمح فقط بملفات الصور (jpg, png, gif, webp)'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB للأخبار
  }
});

// Routes للأخبار - ترتيب المسارات مهم!
router.get('/', getAllNews); // جلب جميع الأخبار (عام)
router.get('/search', searchNews); // البحث في الأخبار (عام) - يجب أن يكون قبل /:id
router.get('/:id', getNewsById); // جلب خبر محدد (عام)

// Routes تتطلب مصادقة
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.fields([
  { name: 'image', maxCount: 1 }
]), logActivity('create_news', 'content', (req) => `News created: ${req.body.title}`), createNews); // إضافة خبر جديد
router.put('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.fields([
  { name: 'image', maxCount: 1 }
]), logActivity('update_news', 'content', (req) => `News updated: ${req.body.title}`), updateNews); // تحديث خبر
router.delete('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('delete_news', 'content', (req) => `News deleted: ID ${req.params.id}`), deleteNews); // حذف خبر

// معالجة أخطاء multer
router.use((error, req, res, next) => {
  console.error('خطأ في رفع ملف خبر:', error);
  
  if (error instanceof multer.MulterError) {
    console.error('خطأ Multer:', error.code, error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت' 
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'عدد الملفات كبير جداً' 
      });
    }
    
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ 
        error: 'تم رفع ملف غير متوقع' 
      });
    }
    
    return res.status(400).json({ 
      error: 'خطأ في رفع الملف: ' + error.message 
    });
  }
  
  if (error.message && error.message.includes('يسمح فقط بملفات الصور')) {
    return res.status(400).json({ 
      error: error.message 
    });
  }
  
  // إذا لم يكن خطأ multer، انتقل للمعالج التالي
  next(error);
});

export default router;
