import express from 'express';
import multer from 'multer';
import { createArticle, getAllArticles, deleteArticle, updateArticle, getArticleById } from '../controllers/articleController.js';
import { authenticateToken, checkPermission, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';

const router = express.Router();

// تكوين multer للذاكرة
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('معالجة ملف:', file.originalname, 'نوع:', file.mimetype);
    
    // التحقق من نوع الملف
    if (file.mimetype.startsWith('image/')) {
      console.log('تم قبول الصورة:', file.originalname);
      cb(null, true);
    } else {
      console.log('تم رفض الملف (ليس صورة):', file.originalname);
      cb(new Error('يسمح فقط بملفات الصور (jpg, png, gif, webp)'), false);
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB
  }
});

// Routes for articles - ترتيب المسارات مهم!
router.get('/', getAllArticles); // جلب جميع المقالات (عام)
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('image'), logActivity('create_article', 'content', (req) => `Article created: ${req.body.title}`), createArticle); // إضافة مقال جديد
router.get('/:id', getArticleById); // جلب مقال محدد (عام)
router.put('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('image'), logActivity('update_article', 'content', (req) => `Article updated: ${req.body.title}`), updateArticle); // تحديث مقال
router.delete('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('delete_article', 'content', (req) => `Article deleted: ID ${req.params.id}`), deleteArticle); // حذف مقال

// معالجة أخطاء multer
router.use((error, req, res, next) => {
  console.error('خطأ في رفع الملف:', error);
  
  if (error instanceof multer.MulterError) {
    console.error('خطأ Multer:', error.code, error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت' 
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
