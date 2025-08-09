const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

// GET /api/stories
async function getAllStories(req, res) {
  const stories = await prisma.story.findMany({ orderBy: { publishDate: 'desc' } });
  res.json(stories);
}

// POST /api/stories
async function createStory(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, storyContent, image, publishDate, location } = req.body;
  try {
    const story = await prisma.story.create({ data: { title, storyContent, image, publishDate, location } });
    res.status(201).json(story);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data', details: err.message });
  }
}

module.exports = { getAllStories, createStory }; 