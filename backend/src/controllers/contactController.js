// src/controllers/contactController.js
// This is a placeholder. In production, you might send an email or store the message in the DB.
const { validationResult } = require('express-validator');

async function submitContactForm(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  // TODO: Store in DB or send email
  res.json({ success: true, message: 'Contact form submitted successfully' });
}

module.exports = { submitContactForm }; 