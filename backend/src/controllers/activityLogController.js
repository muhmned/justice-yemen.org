const prisma = require('../prisma');

const getActivityLog = async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    const where = {};

    if (userId) {
      where.userId = userId;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const activities = await prisma.activityLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        User: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    const formattedActivities = activities.map(a => ({
      id: a.id,
      userId: a.userId,
      username: a.User.username,
      userRole: a.User.role,
      action: a.action,
      actionType: a.actionType,
      details: a.details,
      status: a.status,
      ipAddress: a.ipAddress,
      userAgent: a.userAgent,
      createdAt: a.createdAt,
    }));

    res.json({ activities: formattedActivities });
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = {
  getActivityLog,
};
