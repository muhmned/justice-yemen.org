import express from 'express';
import { body } from 'express-validator';
import { getAllStories, createStory } from '../controllers/storyController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';
import prisma from '../prisma.js';

const router = express.Router();

// Public: Get all stories
router.get('/', getAllStories);

const storyValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('storyContent').notEmpty().withMessage('Story content is required'),
];

// Editor/Admin: Create story
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), storyValidation, createStory);

// ===== تقارير =====
// إنشاء تقرير
router.post('/reports', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('create_report'), async (req, res) => {
  try {
    const { title, summary, content, thumbnail, pdfUrl, publishDate, status = 'draft' } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });
    }

    const report = await prisma.report.create({
      data: {
        title,
        summary,
        content,
        thumbnail,
        pdfUrl,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        status,
        userId
      }
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error('خطأ في إنشاء التقرير:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء التقرير' });
  }
});

// تعديل تقرير
router.put('/reports/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('update_report'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, thumbnail, pdfUrl, publishDate, status } = req.body;
    const userId = req.user.id;

    // التحقق من وجود التقرير
    const existingReport = await prisma.report.findUnique({
      where: { id }
    });

    if (!existingReport) {
      return res.status(404).json({ error: 'التقرير غير موجود' });
    }

    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        title,
        summary,
        content,
        thumbnail,
        pdfUrl,
        publishDate: publishDate ? new Date(publishDate) : existingReport.publishDate,
        status,
        userId
      }
    });

    res.json({ success: true, report: updatedReport });
  } catch (error) {
    console.error('خطأ في تعديل التقرير:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل التقرير' });
  }
});

// ===== مقالات =====
// إنشاء مقال
router.post('/articles', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('create_article'), async (req, res) => {
  try {
    const { title, content, summary, image, publishDate, status = 'draft', sectionId, categoryId } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });
    }

    const article = await prisma.article.create({
      data: {
        title,
        content,
        summary,
        image,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        status,
        sectionId,
        categoryId,
        userId
      }
    });

    res.status(201).json({ success: true, article });
  } catch (error) {
    console.error('خطأ في إنشاء المقال:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء المقال' });
  }
});

// تعديل مقال
router.put('/articles/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('update_article'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, summary, image, publishDate, status, sectionId, categoryId } = req.body;
    const userId = req.user.id;

    // التحقق من وجود المقال
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });

    if (!existingArticle) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }

    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title,
        content,
        summary,
        image,
        publishDate: publishDate ? new Date(publishDate) : existingArticle.publishDate,
        status,
        sectionId,
        categoryId,
        userId
      }
    });

    res.json({ success: true, article: updatedArticle });
  } catch (error) {
    console.error('خطأ في تعديل المقال:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل المقال' });
  }
});

// ===== أخبار =====
// إنشاء خبر
router.post('/news', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('create_news'), async (req, res) => {
  try {
    const { title, summary, content, image, publishDate, status = 'draft' } = req.body;
    const userId = req.user.id;

    if (!title || !content) {
      return res.status(400).json({ error: 'العنوان والمحتوى مطلوبان' });
    }

    const news = await prisma.news.create({
      data: {
        title,
        summary,
        content,
        image,
        publishDate: publishDate ? new Date(publishDate) : new Date(),
        status,
        userId
      }
    });

    res.status(201).json({ success: true, news });
  } catch (error) {
    console.error('خطأ في إنشاء الخبر:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الخبر' });
  }
});

// تعديل خبر
router.put('/news/:id', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), logActivity('update_news'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, summary, content, image, publishDate, status } = req.body;
    const userId = req.user.id;

    // التحقق من وجود الخبر
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });

    if (!existingNews) {
      return res.status(404).json({ error: 'الخبر غير موجود' });
    }

    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title,
        summary,
        content,
        image,
        publishDate: publishDate ? new Date(publishDate) : existingNews.publishDate,
        status,
        userId
      }
    });

    res.json({ success: true, news: updatedNews });
  } catch (error) {
    console.error('خطأ في تعديل الخبر:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تعديل الخبر' });
  }
});

export default router; 