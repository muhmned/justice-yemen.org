const express = require('express');
const router = express.Router();
const { getAllStatements, createStatement } = require('../controllers/statementController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// تحقق من صحة بيانات البيان
const statementValidation = [
  body('title').notEmpty().withMessage('عنوان البيان مطلوب'),
  body('content').notEmpty().withMessage('محتوى البيان مطلوب'),
];

// عام: جلب جميع البيانات
router.get('/', getAllStatements);
// محرر/مدير: إضافة بيان
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), statementValidation, createStatement);

module.exports = router; 