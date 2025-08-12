// src/routes/categoryRoutes.js
import express from 'express';
import { body } from 'express-validator';
import { 
  getAllCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory
} from '../controllers/categoryController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';

const router = express.Router();

// عام: جلب جميع التصنيفات
router.get('/', getAllCategories);

// Routes for Admins
router.post('/', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('create_category', 'content', (req) => `Category created: ${req.body.name}`), createCategory);
router.put('/:id', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('update_category', 'content', (req) => `Category updated: ${req.body.name}`), updateCategory);
router.delete('/:id', authenticateToken, requireRole(['admin', 'system_admin']), logActivity('delete_category', 'content', (req) => `Category deleted: ID ${req.params.id}`), deleteCategory);

export default router;
