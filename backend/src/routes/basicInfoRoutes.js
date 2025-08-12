import express from 'express';
import { getBasicInfo, updateBasicInfo } from '../controllers/basicInfoController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// جلب بيانات الصفحة (عام)
router.get('/:page', getBasicInfo);

// تحديث بيانات الصفحة (يتطلب صلاحية أدمن)
router.put('/:page', authenticateToken, requireRole(['admin', 'system_admin']), updateBasicInfo);

export default router; 