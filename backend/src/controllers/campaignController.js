import prisma from '../prisma.js';
import { validationResult } from 'express-validator';

// GET /api/campaigns
async function getAllCampaigns(req, res) {
  const campaigns = await prisma.campaign.findMany({ orderBy: { startDate: 'desc' } });
  res.json(campaigns);
}

// POST /api/campaigns
async function createCampaign(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, description, image, startDate, endDate, status } = req.body;
  try {
    const campaign = await prisma.campaign.create({ data: { title, description, image, startDate, endDate, status } });
    res.status(201).json(campaign);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data', details: err.message });
  }
}

export { getAllCampaigns, createCampaign }; 