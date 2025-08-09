const prisma = require('../prisma');

const getGeneralStats = async (req, res, next) => {
  try {
    const userCount = await prisma.user.count();
    const activityLogCount = await prisma.activityLog.count();
    
    const newsPublishedCount = await prisma.news.count({ where: { status: 'published' } });
    const newsDraftCount = await prisma.news.count({ where: { status: 'draft' } });
    
    const reportsPublishedCount = await prisma.report.count({ where: { status: 'published' } });
    const reportsDraftCount = await prisma.report.count({ where: { status: 'draft' } });
    
    const articleCount = await prisma.article.count();
    const sectionCount = await prisma.section.count();
    
    const contactMessagesByStatus = await prisma.contactMessage.groupBy({
      by: ['status'],
      _count: {
        status: true,
      },
    });

    // Format the contact messages count
    const contactMessagesCount = contactMessagesByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, { UNREAD: 0, READ: 0, REPLIED: 0, ARCHIVED: 0 });

    res.json({
      userCount,
      activityLogCount,
      newsCount: {
        published: newsPublishedCount,
        draft: newsDraftCount,
      },
      reportsCount: {
        published: reportsPublishedCount,
        draft: reportsDraftCount,
      },
      articleCount,
      sectionCount,
      contactMessagesCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getGeneralStats,
};
