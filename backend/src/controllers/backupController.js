import { promises as fs } from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import prisma from '../prisma.js';
const execAsync = util.promisify(exec);

export const backupDatabase = async (req, res) => {
  try {
    const { type = 'full' } = req.body;
    
    // التحقق من صحة نوع النسخة الاحتياطية
    if (!['full', 'tables', 'sections'].includes(type)) {
      return res.status(400).json({ error: 'نوع النسخة الاحتياطية غير صالح' });
    }
    
    // التحقق من وجود المستخدم
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: 'غير مصرح لك بإنشاء نسخ احتياطية' });
    }
    
    // إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
    const backupDir = path.join(__dirname, '../../backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${type}-${timestamp}.json`;
    const backupPath = path.join(backupDir, backupFileName);
    
    let backupData = {};
    
    if (type === 'full') {
      // نسخ احتياطية كاملة لجميع الجداول
      backupData = {
        users: await prisma.user.findMany(),
        sections: await prisma.section.findMany(),
        categories: await prisma.category.findMany(),
        articles: await prisma.article.findMany(),
        news: await prisma.news.findMany(),
        reports: await prisma.report.findMany(),
        statements: await prisma.statement.findMany(),
        stories: await prisma.story.findMany(),
        campaigns: await prisma.campaign.findMany(),
        settings: await prisma.setting.findMany(),
        basicInfo: await prisma.basicInfo.findMany(),
        contactInfo: await prisma.contactInfo.findMany(),
        activityLogs: await prisma.activityLog.findMany(),
        metadata: {
          timestamp: new Date().toISOString(),
          type: 'full',
          version: '1.0'
        }
      };
    } else if (type === 'tables') {
      // نسخ احتياطية للجداول الرئيسية فقط
      backupData = {
        users: await prisma.user.findMany(),
        sections: await prisma.section.findMany(),
        categories: await prisma.category.findMany(),
        articles: await prisma.article.findMany(),
        news: await prisma.news.findMany(),
        reports: await prisma.report.findMany(),
        metadata: {
          timestamp: new Date().toISOString(),
          type: 'tables',
          version: '1.0'
        }
      };
    } else if (type === 'sections') {
      // نسخ احتياطية للأقسام والمقالات فقط
      backupData = {
        sections: await prisma.section.findMany(),
        categories: await prisma.category.findMany(),
        articles: await prisma.article.findMany(),
        metadata: {
          timestamp: new Date().toISOString(),
          type: 'sections',
          version: '1.0'
        }
      };
    }
    
    // حفظ النسخة الاحتياطية
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    // تسجيل النشاط
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'backup_created',
        details: `Created ${type} backup: ${backupFileName}`,
        actionType: 'system',
        status: 'success'
      }
    });
    
    res.json({ 
      message: 'تم إنشاء النسخة الاحتياطية بنجاح',
      filename: backupFileName,
      type: type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'فشل في إنشاء النسخة الاحتياطية: ' + error.message });
  }
};

export const importDatabase = async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
  }
  
  // التحقق من نوع الملف
  if (!file.originalname.endsWith('.json')) {
    return res.status(400).json({ error: 'يسمح فقط بملفات JSON' });
  }
  
  try {
    
    console.log('Importing file:', file.path);
    console.log('File size:', file.size);
    
    // قراءة ملف النسخة الاحتياطية
    const backupData = JSON.parse(await fs.readFile(file.path, 'utf8'));
    
    console.log('Backup data keys:', Object.keys(backupData));
    console.log('Backup metadata:', backupData.metadata);
    
    if (!backupData.metadata) {
      return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح' });
    }
    
    // بدء عملية الاستيراد
    await prisma.$transaction(async (tx) => {
      // حذف البيانات الموجودة (حسب نوع النسخة الاحتياطية)
      if (backupData.metadata.type === 'full') {
        await tx.activityLog.deleteMany();
        await tx.contactInfo.deleteMany();
        await tx.basicInfo.deleteMany();
        await tx.setting.deleteMany();
        await tx.campaign.deleteMany();
        await tx.story.deleteMany();
        await tx.statement.deleteMany();
        await tx.report.deleteMany();
        await tx.news.deleteMany();
        await tx.article.deleteMany();
        await tx.category.deleteMany();
        await tx.section.deleteMany();
        await tx.user.deleteMany();
      } else if (backupData.metadata.type === 'tables') {
        await tx.report.deleteMany();
        await tx.news.deleteMany();
        await tx.article.deleteMany();
        await tx.category.deleteMany();
        await tx.section.deleteMany();
      } else if (backupData.metadata.type === 'sections') {
        await tx.article.deleteMany();
        await tx.category.deleteMany();
        await tx.section.deleteMany();
      }
      // الإدخال الجماعي
      if (backupData.users && backupData.users.length) {
        await tx.user.createMany({ data: backupData.users });
      }
      if (backupData.sections && backupData.sections.length) {
        await tx.section.createMany({ data: backupData.sections });
      }
      if (backupData.categories && backupData.categories.length) {
        await tx.category.createMany({ data: backupData.categories });
      }
      if (backupData.articles && backupData.articles.length) {
        await tx.article.createMany({ data: backupData.articles });
      }
      if (backupData.news && backupData.news.length) {
        await tx.news.createMany({ data: backupData.news });
      }
      if (backupData.reports && backupData.reports.length) {
        await tx.report.createMany({ data: backupData.reports });
      }
      if (backupData.statements && backupData.statements.length) {
        await tx.statement.createMany({ data: backupData.statements });
      }
      if (backupData.stories && backupData.stories.length) {
        await tx.story.createMany({ data: backupData.stories });
      }
      if (backupData.campaigns && backupData.campaigns.length) {
        await tx.campaign.createMany({ data: backupData.campaigns });
      }
      if (backupData.settings && backupData.settings.length) {
        await tx.setting.createMany({ data: backupData.settings });
      }
      if (backupData.basicInfo && backupData.basicInfo.length) {
        await tx.basicInfo.createMany({ data: backupData.basicInfo });
      }
      if (backupData.contactInfo && backupData.contactInfo.length) {
        await tx.contactInfo.createMany({ data: backupData.contactInfo });
      }
      if (backupData.activityLogs && backupData.activityLogs.length) {
        await tx.activityLog.createMany({ data: backupData.activityLogs });
      }
    });
    
    // حذف الملف المؤقت
    await fs.unlink(file.path);
    
    // تسجيل النشاط
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'database_imported',
        details: `Imported ${backupData.metadata.type} backup from ${file.originalname}`,
        actionType: 'system',
        status: 'success'
      }
    });
    
    res.json({ 
      message: 'تم استيراد قاعدة البيانات بنجاح',
      type: backupData.metadata.type,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Import error:', error);
    
    // حذف الملف المؤقت في حالة الخطأ
    try {
      if (file && file.path) {
        await fs.unlink(file.path);
      }
    } catch (unlinkError) {
      console.error('Error deleting temp file:', unlinkError);
    }
    
    // رسائل خطأ أكثر تفصيلاً
    let errorMessage = 'فشل في استيراد قاعدة البيانات';
    
    if (error.message.includes('JSON')) {
      errorMessage = 'ملف JSON غير صالح';
    } else if (error.message.includes('ENOENT')) {
      errorMessage = 'الملف غير موجود';
    } else if (error.message.includes('permission')) {
      errorMessage = 'خطأ في الصلاحيات';
    } else {
      errorMessage += ': ' + error.message;
    }
    
    res.status(500).json({ error: errorMessage });
  }
};

// الحصول على قائمة النسخ الاحتياطية
export const getBackups = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    
    try {
      await fs.access(backupDir);
    } catch {
      // المجلد غير موجود، إرجاع قائمة فارغة
      return res.json({ backups: [] });
    }
    
    const files = await fs.readdir(backupDir);
    const backups = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const filePath = path.join(backupDir, file);
        const stats = await fs.stat(filePath);
        
        try {
          const content = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(content);
          
          backups.push({
            filename: file,
            size: stats.size,
            createdAt: stats.birthtime,
            type: data.metadata?.type || 'unknown',
            version: data.metadata?.version || '1.0'
          });
        } catch (parseError) {
          console.error(`Error parsing backup file ${file}:`, parseError);
        }
      }
    }
    
    // ترتيب النسخ الاحتياطية حسب التاريخ (الأحدث أولاً)
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ backups });
    
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({ error: 'فشل في الحصول على قائمة النسخ الاحتياطية' });
  }
};

// حذف نسخة احتياطية
export const deleteBackup = async (req, res) => {
  try {
    const { filename } = req.params;
    
    if (!filename || !filename.endsWith('.json')) {
      return res.status(400).json({ error: 'اسم الملف غير صالح' });
    }
    
    const backupDir = path.join(__dirname, '../../backups');
    const filePath = path.join(backupDir, filename);
    
    // التحقق من وجود الملف
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ error: 'الملف غير موجود' });
    }
    
    // حذف الملف
    await fs.unlink(filePath);
    
    // تسجيل النشاط
    await prisma.activityLog.create({
      data: {
        userId: req.user.id,
        action: 'backup_deleted',
        details: `Deleted backup: ${filename}`,
        actionType: 'system',
        status: 'success'
      }
    });
    
    res.json({ message: 'تم حذف النسخة الاحتياطية بنجاح' });
    
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ error: 'فشل في حذف النسخة الاحتياطية' });
  }
};

// دالة لفحص استيراد ملف JSON فقط
export const importTestFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف' });
    }
    const fsSync = require('fs');
    const filePath = req.file.path;
    const fileContent = fsSync.readFileSync(filePath, 'utf8');
    let data;
    try {
      data = JSON.parse(fileContent);
    } catch (err) {
      return res.status(400).json({ success: false, message: 'ملف JSON غير صالح', error: err.message });
    }
    // حذف الملف المؤقت بعد القراءة
    fsSync.unlinkSync(filePath);
    res.json({
      success: true,
      message: 'تم رفع الملف وتحليله بنجاح!',
      keys: Object.keys(data),
      size: fileContent.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء استيراد الملف', error: err.message });
  }
};
