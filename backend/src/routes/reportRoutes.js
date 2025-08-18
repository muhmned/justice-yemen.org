import express from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { getAllReports, createReport, updateReport, deleteReport, getReportById, searchReports } from '../controllers/reportController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';

const router = express.Router();

// تكوين multer للذاكرة
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    console.log('معالجة ملف تقرير:', file.originalname, 'نوع:', file.mimetype);
    
    // التحقق من نوع الملف
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) {
      console.log('تم قبول الملف:', file.originalname);
      cb(null, true);
    } else {
      console.log('تم رفض الملف (نوع غير مدعوم):', file.originalname);
      cb(new Error('يسمح فقط بملفات PDF والصور (jpg, png, gif, webp)'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB للتقارير
  }
});

// تحقق من صحة بيانات التقرير
const reportValidation = [
  body('title').notEmpty().withMessage('عنوان التقرير مطلوب'),
  body('publishDate')
    .optional()
    .custom((value) => {
      if (value === null || value === undefined) return true;
      return new Date(value).toString() !== 'Invalid Date';
    }).withMessage('تاريخ النشر يجب أن يكون بصيغة صحيحة'),
];

// عام: جلب جميع التقارير
router.get('/', getAllReports);
// عام: البحث في التقارير - يجب أن يكون قبل /:id
router.get('/search', searchReports);
// عام: جلب تقرير محدد - يجب أن يكون بعد /search
router.get('/:id', getReportById);

// محرر/مدير: إضافة تقرير
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), reportValidation, logActivity('create_report', 'content', (req) => `Report created: ${req.body.title}`), createReport);
// محرر/مدير: تعديل تقرير
router.put('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 }
]), reportValidation, logActivity('update_report', 'content', (req) => `Report updated: ${req.body.title}`), updateReport);
// محرر/مدير: حذف تقرير
router.delete('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('delete_report', 'content', (req) => `Report deleted: ID ${req.params.id}`), deleteReport);

// معالجة أخطاء multer
router.use((error, req, res, next) => {
  console.error('خطأ في رفع ملف تقرير:', error);
  
  if (error instanceof multer.MulterError) {
    console.error('خطأ Multer:', error.code, error.message);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' 
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
  
  if (error.message && error.message.includes('يسمح فقط بملفات PDF والصور')) {
    return res.status(400).json({ 
      error: error.message 
    });
  }
  
  // إذا لم يكن خطأ multer، انتقل للمعالج التالي
  next(error);
});

export default router;
