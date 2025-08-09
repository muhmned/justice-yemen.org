const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/settings
async function getSettings(req, res) {
  const settings = await prisma.setting.findMany();
  res.json(settings);
}

// PUT /api/settings (admin only)
async function updateSettings(req, res) {
  const { key, value } = req.body;
  try {
    const updated = await prisma.setting.update({ where: { key }, data: { value } });
    // تسجيل العملية
    if (req.user) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'update_setting',
          details: `Updated setting: ${key}`
        }
      });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Setting not found or invalid data' });
  }
}

module.exports = { getSettings, updateSettings }; 