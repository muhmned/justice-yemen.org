import express from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';
import { uploadFile } from '../utils/storageProvider.js';

const router = express.Router();
const prisma = new PrismaClient();

// تكوين multer للذاكرة
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB للصور
  }
});

// جلب جميع الإعدادات
router.get('/', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const result = {};
    settings.forEach(s => {
      result[s.key] = s.value;
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// رفع الشعار فقط
router.post('/logo', authenticateToken, requireRole(['admin', 'system_admin']), upload.single('site_logo'), logActivity('update_settings', 'settings', () => 'Site logo updated'), async (req, res) => {
  try {
    console.log('=== رفع الشعار فقط ===');
    console.log('File:', req.file);
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي ملف' });
    }
    
    // استخدام storageProvider لرفع الملف
    const logoUrl = await uploadFile(req.file);
    
    await prisma.setting.upsert({
      where: { key: 'site_logo' },
      update: { value: logoUrl },
      create: { key: 'site_logo', value: logoUrl }
    });
    res.json({ message: 'تم رفع الشعار بنجاح', logoUrl });
  } catch (error) {
    console.error('خطأ في رفع الشعار:', error);
    res.status(500).json({ message: 'خطأ في رفع الشعار', error: error.message });
  }
});

// تحديث الإعدادات النصية فقط (بدون ملف)
router.put('/', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('update_settings', 'settings', () => 'Site settings updated'), async (req, res) => {
  try {
    console.log('=== تحديث الإعدادات النصية ===');
    console.log('Body:', req.body);
    const { site_name, site_font, site_language, site_languages } = req.body;
    if (site_name) {
      await prisma.setting.upsert({
        where: { key: 'site_name' },
        update: { value: site_name },
        create: { key: 'site_name', value: site_name }
      });
    }
    if (site_font) {
      await prisma.setting.upsert({
        where: { key: 'site_font' },
        update: { value: site_font },
        create: { key: 'site_font', value: site_font }
      });
    }
    if (site_language) {
      await prisma.setting.upsert({
        where: { key: 'site_language' },
        update: { value: site_language },
        create: { key: 'site_language', value: site_language }
      });
    }
    if (site_languages) {
      await prisma.setting.upsert({
        where: { key: 'site_languages' },
        update: { value: site_languages },
        create: { key: 'site_languages', value: site_languages }
      });
    }
    res.json({ message: 'تم تحديث الإعدادات بنجاح' });
  } catch (error) {
    console.error('خطأ في تحديث الإعدادات النصية:', error);
    res.status(500).json({ message: 'خطأ في تحديث الإعدادات', error: error.message });
  }
});

// جلب نص وصورة من نحن
router.get('/about', async (req, res) => {
  try {
    const aboutText = await prisma.setting.findUnique({ where: { key: 'about_text' } });
    const aboutImage = await prisma.setting.findUnique({ where: { key: 'about_image' } });
    res.json({
      about_text: aboutText ? aboutText.value : '',
      about_image: aboutImage ? aboutImage.value : ''
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب بيانات من نحن' });
  }
});

// تحديث نص من نحن
router.put('/about', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('update_settings', 'settings', () => 'About Us text updated'), async (req, res) => {
  try {
    const { about_text } = req.body;
    await prisma.setting.upsert({
      where: { key: 'about_text' },
      update: { value: about_text },
      create: { key: 'about_text', value: about_text }
    });
    res.json({ message: 'تم تحديث نص من نحن' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في تحديث نص من نحن' });
  }
});

// رفع صورة من نحن
router.post('/about-image', authenticateToken, requireRole(['admin', 'system_admin']), upload.single('about_image'), logActivity('update_settings', 'settings', () => 'About Us image updated'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
    
    // استخدام storageProvider لرفع الملف
    const imageUrl = await uploadFile(req.file);
    
    await prisma.setting.upsert({
      where: { key: 'about_image' },
      update: { value: imageUrl },
      create: { key: 'about_image', value: imageUrl }
    });
    res.json({ message: 'تم رفع الصورة', about_image: imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في رفع صورة من نحن' });
  }
});

export default router;
