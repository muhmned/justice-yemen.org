import express from 'express';
import { body } from 'express-validator';
import { getAllCampaigns, createCampaign } from '../controllers/campaignController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';

const router = express.Router();

// Public: Get all campaigns
router.get('/', getAllCampaigns);

const campaignValidation = [
  body('title').notEmpty().withMessage('Title is required'),
];

// Editor/Admin: Create campaign
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), campaignValidation, createCampaign);

export default router; 