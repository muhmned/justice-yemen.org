import express from 'express';
import { body } from 'express-validator';
import { getAllStatements, createStatement } from '../controllers/statementController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';

const router = express.Router();

// تحقق من صحة بيانات البيان
const statementValidation = [
  body('title').notEmpty().withMessage('عنوان البيان مطلوب'),
  body('content').notEmpty().withMessage('محتوى البيان مطلوب'),
];

// عام: جلب جميع البيانات
router.get('/', getAllStatements);
// محرر/مدير: إضافة بيان
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), statementValidation, createStatement);

export default router; 