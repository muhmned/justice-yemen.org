const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { validationResult } = require('express-validator');

// GET /api/statements
async function getAllStatements(req, res) {
  const statements = await prisma.statement.findMany({ orderBy: { publishDate: 'desc' } });
  res.json(statements);
}

// POST /api/statements
async function createStatement(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { title, content, publishDate, status } = req.body;
  try {
    const statement = await prisma.statement.create({ data: { title, content, publishDate, status } });
    res.status(201).json(statement);
  } catch (err) {
    res.status(400).json({ error: 'Invalid data', details: err.message });
  }
}

module.exports = { getAllStatements, createStatement }; 