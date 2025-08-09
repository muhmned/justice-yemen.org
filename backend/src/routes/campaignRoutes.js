const express = require('express');
const router = express.Router();
const { getAllCampaigns, createCampaign } = require('../controllers/campaignController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// Public: Get all campaigns
router.get('/', getAllCampaigns);

const campaignValidation = [
  body('title').notEmpty().withMessage('Title is required'),
];

// Editor/Admin: Create campaign
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), campaignValidation, createCampaign);

module.exports = router; 