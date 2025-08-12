import express from 'express';
import multer from 'multer';
import path from 'path';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, base + '-' + unique + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// POST /api/upload (single file)
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('تم رفع الملف بنجاح:', req.file.originalname, '->', fileUrl);
    
    res.json({ 
      success: true, 
      url: fileUrl, 
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء رفع الملف' });
  }
});

// معالجة أخطاء multer
router.use((error, req, res, next) => {
  console.error('خطأ في رفع ملف:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'حجم الملف كبير جداً. الحد الأقصى 10 ميجابايت' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'عدد الملفات كبير جداً' });
    }
    return res.status(400).json({ error: 'خطأ في رفع الملف: ' + error.message });
  }
  
  res.status(500).json({ error: 'حدث خطأ في الخادم' });
});

export default router; 