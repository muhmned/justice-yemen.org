import express from 'express';
import { body } from 'express-validator';
import { getAllStories, createStory } from '../controllers/storyController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import logActivity from '../middleware/logActivity.js';

const router = express.Router();

// Public: Get all stories
router.get('/', getAllStories);

const storyValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('storyContent').notEmpty().withMessage('Story content is required'),
];

// Editor/Admin: Create story
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), storyValidation, createStory);

export default router; 