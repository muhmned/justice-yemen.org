import express from 'express';
import { PrismaClient } from '@prisma/client';
import { getGeneralStats } from '../controllers/statsController.js';
import { authenticateToken, checkPermission } from '../middleware/auth.js';

const router = express.Router();

// GET /api/stats/general - Accessible by users with dashboard_view permission
router.get('/general', authenticateToken, checkPermission('dashboard_view'), getGeneralStats);

export default router;
