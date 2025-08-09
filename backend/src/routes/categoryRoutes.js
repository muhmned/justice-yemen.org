// src/routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const logActivity = require('../middleware/logActivity');

// عام: جلب جميع التصنيفات
router.get('/', getAllCategories);

// Routes for Admins
router.post('/', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('create_category', 'content', (req) => `Category created: ${req.body.name}`), createCategory);
router.put('/:id', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('update_category', 'content', (req) => `Category updated: ${req.body.name}`), updateCategory);
router.delete('/:id', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('delete_category', 'content', (req) => `Category deleted: ID ${req.params.id}`), deleteCategory);

module.exports = router;
