const express = require('express');
const router = express.Router();
const { getBasicInfo, updateBasicInfo } = require('../controllers/basicInfoController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// جلب بيانات الصفحة (عام)
router.get('/:page', getBasicInfo);

// تحديث بيانات الصفحة (يتطلب صلاحية أدمن)
router.put('/:page', authenticateToken, requireRole(['admin', 'system_admin']), updateBasicInfo);

module.exports = router; 