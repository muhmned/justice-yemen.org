const express = require('express');
const router = express.Router();
const { getGeneralStats } = require('../controllers/statsController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

// GET /api/stats/general - Accessible by users with dashboard_view permission
router.get('/general', authenticateToken, checkPermission('dashboard_view'), getGeneralStats);

module.exports = router;
