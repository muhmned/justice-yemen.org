const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken, checkPermission, requireRole } = require('../middleware/auth');
const logActivity = require('../middleware/logActivity');
const {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  searchNews
} = require('../controllers/newsController');

// إعداد multer لرفع الصور
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'news-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
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

// Routes للأخبار
router.get('/', getAllNews); // جلب جميع الأخبار (عام)
router.get('/search', searchNews); // البحث في الأخبار (عام)
router.get('/:id', getNewsById); // جلب خبر محدد (عام)

// Routes تتطلب مصادقة
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('image'), logActivity('create_news', 'content', (req) => `News created: ${req.body.title}`), createNews); // إضافة خبر جديد
router.put('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('image'), logActivity('update_news', 'content', (req) => `News updated: ${req.body.title}`), updateNews); // تحديث خبر
router.delete('/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('delete_news', 'content', (req) => `News deleted: ID ${req.params.id}`), deleteNews); // حذف خبر

module.exports = router;
