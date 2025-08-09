const prisma = require('../prisma');

const logActivity = (action, actionType = 'general', details) => (req, res, next) => {
  const originalSend = res.send;
  let responseBody;

  res.send = function (body) {
    responseBody = body;
    return originalSend.apply(res, arguments);
  };

  const log = async () => {
    res.removeListener('finish', log);
    res.removeListener('close', log);

    try {
      const userId = req.user?.id || req.admin?.id;
      if (!userId) return;

      const status = res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure';
      
      let logDetails = details;
      if (typeof details === 'function') {
        logDetails = details(req, res, responseBody);
      } else {
        logDetails = details || `User performed ${action}`;
      }

      await prisma.activityLog.create({
        data: {
          action,
          actionType,
          details: logDetails,
          status,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent') || 'Unknown',
          User: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  };

  res.on('finish', log);
  res.on('close', log);

  next();
};

module.exports = logActivity;
