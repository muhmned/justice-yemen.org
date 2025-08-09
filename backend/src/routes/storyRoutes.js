const express = require('express');
const router = express.Router();
const { getAllStories, createStory } = require('../controllers/storyController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');

// Public: Get all stories
router.get('/', getAllStories);

const storyValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('storyContent').notEmpty().withMessage('Story content is required'),
];

// Editor/Admin: Create story
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), storyValidation, createStory);

module.exports = router; 