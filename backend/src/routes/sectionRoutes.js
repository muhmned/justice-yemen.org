const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const logActivity = require('../middleware/logActivity');

const prisma = new PrismaClient();

// جلب جميع الأقسام
router.get('/', async (req, res) => {
  try {
    const sections = await prisma.section.findMany();
    res.json(sections);
  } catch (error) {
    console.error('❌ [Sections] Error fetching all:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأقسام. حاول لاحقًا.' });
  }
});

// جلب الأقسام النشطة مرتبة
router.get('/active', async (req, res) => {
  try {
    const sections = await prisma.section.findMany({
      where: { status: 'active' },
      orderBy: { order: 'asc' }
    });
    res.json(sections);
  } catch (error) {
    console.error('❌ [Sections] Error fetching active:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأقسام النشطة.' });
  }
});

// جلب قسم حسب slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const section = await prisma.section.findUnique({
      where: { slug: req.params.slug }
    });
    if (!section) return res.status(404).json({ error: 'القسم غير موجود.' });
    res.json(section);
  } catch (error) {
    console.error('❌ [Sections] Error fetching by slug:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب القسم.' });
  }
});

// إضافة قسم جديد
router.post('/', authenticateToken, checkPermission('add_section'), logActivity('create_section', 'content', (req) => `Section created: ${req.body.name}`), async (req, res) => {
  const { name, description, slug, status, order } = req.body;
  try {
    const section = await prisma.section.create({
      data: { name, description, slug, status, order }
    });
    res.status(201).json({ message: 'تم إضافة القسم بنجاح', section });
  } catch (err) {
    console.error('❌ [Sections] Error creating:', err);
    res.status(400).json({ error: err.message || 'تعذر إضافة القسم.' });
  }
});

// تعديل قسم
router.put('/:id', authenticateToken, checkPermission('edit_section'), logActivity('update_section', 'content', (req) => `Section updated: ${req.body.name}`), async (req, res) => {
  const { id } = req.params;
  const { name, description, slug, status, order } = req.body;
  try {
    const section = await prisma.section.update({
      where: { id },
      data: { name, description, slug, status, order }
    });
    res.json({ message: 'تم تحديث القسم بنجاح', section });
  } catch (err) {
    console.error('❌ [Sections] Error updating:', err);
    res.status(400).json({ error: err.message || 'تعذر تحديث القسم.' });
  }
});

// حذف قسم
router.delete('/:id', authenticateToken, checkPermission('delete_section'), logActivity('delete_section', 'content', (req) => `Section deleted: ID ${req.params.id}`), async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.section.delete({ where: { id } });
    res.json({ message: 'تم حذف القسم بنجاح', success: true });
  } catch (err) {
    console.error('❌ [Sections] Error deleting:', err);
    res.status(400).json({ error: err.message || 'تعذر حذف القسم.' });
  }
});

module.exports = router;
