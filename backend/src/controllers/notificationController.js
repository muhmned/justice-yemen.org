
import prisma from '../prisma.js';

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifications = await prisma.notification.findMany({
      where: {
        userId: userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    res.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'فشل في جلب الإشعارات' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
      },
      data: {
        read: true,
      },
    });

    res.json({ message: 'تم تحديث الإشعار' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'فشل في تحديث الإشعار' });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { title, message, type, userId } = req.body;

    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        userId: userId || req.user.id,
      },
    });

    res.json({ notification });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'فشل في إنشاء الإشعار' });
  }
};
// دالة لإنشاء إشعارات واقعية بناءً على البيانات الفعلية
async function createRealisticNotifications(prisma, userId) {
  const notifications = [];

  try {
    // فحص المقالات في انتظار المراجعة
    const pendingArticles = await prisma.article.count({
      where: {
        publishDate: null,
        status: 'draft'
      }
    });

    if (pendingArticles > 0) {
      notifications.push({
        id: `pending_${Date.now()}`,
        title: 'مقالات في انتظار المراجعة',
        message: `يوجد ${pendingArticles} مقال في انتظار المراجعة والنشر`,
        type: 'warning',
        time: 'منذ ساعة',
        icon: 'FileTextOutlined'
      });
    }

    // فحص المسودات
    const drafts = await prisma.article.count({
      where: {
        status: 'draft'
      }
    });

    if (drafts > 0) {
      notifications.push({
        id: `drafts_${Date.now()}`,
        title: 'مسودات متاحة',
        message: `لديك ${drafts} مسودة جاهزة للتحرير`,
        type: 'info',
        time: 'منذ 3 ساعات',
        icon: 'EditOutlined'
      });
    }

    // فحص النسخ الاحتياطية
    const fs = require('fs').promises;
    const path = require('path');
    const backupDir = path.join(__dirname, '../../backups');

    try {
      const backupFiles = await fs.readdir(backupDir);
      const jsonFiles = backupFiles.filter(file => file.endsWith('.json'));
      
      if (jsonFiles.length > 0) {
        const latestBackup = jsonFiles[0]; // أول ملف (الأحدث)
        const backupPath = path.join(backupDir, latestBackup);
        const stats = await fs.stat(backupPath);
        const hoursSinceBackup = Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60));

        if (hoursSinceBackup > 24) {
          notifications.push({
            id: `backup_old_${Date.now()}`,
            title: 'نسخة احتياطية قديمة',
            message: `آخر نسخة احتياطية منذ ${hoursSinceBackup} ساعة`,
            type: 'warning',
            time: 'منذ 6 ساعات',
            icon: 'DatabaseOutlined'
          });
        } else {
          notifications.push({
            id: `backup_recent_${Date.now()}`,
            title: 'نسخة احتياطية حديثة',
            message: `تم إنشاء نسخة احتياطية بنجاح منذ ${hoursSinceBackup} ساعة`,
            type: 'success',
            time: 'منذ 6 ساعات',
            icon: 'CheckCircleOutlined'
          });
        }
      }
    } catch (error) {
      // إذا لم يوجد مجلد النسخ الاحتياطية
      notifications.push({
        id: `no_backup_${Date.now()}`,
        title: 'لا توجد نسخ احتياطية',
        message: 'لم يتم إنشاء أي نسخة احتياطية بعد',
        type: 'warning',
        time: 'منذ 12 ساعة',
        icon: 'DatabaseOutlined'
      });
    }

    // فحص معدل النشر
    const totalArticles = await prisma.article.count();
    const publishedArticles = await prisma.article.count({
      where: {
        publishDate: {
          not: null
        }
      }
    });

    if (totalArticles > 0 && (publishedArticles / totalArticles) < 0.5) {
      notifications.push({
        id: `low_publish_rate_${Date.now()}`,
        title: 'معدل النشر منخفض',
        message: `نسبة المقالات المنشورة ${Math.round((publishedArticles / totalArticles) * 100)}%`,
        type: 'info',
        time: 'منذ 12 ساعة',
        icon: 'BarChartOutlined'
      });
    }

    // فحص المستخدمين الجدد
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر أسبوع
        }
      }
    });

    if (recentUsers > 0) {
      notifications.push({
        id: `new_users_${Date.now()}`,
        title: 'مستخدمين جدد',
        message: `تم تسجيل ${recentUsers} مستخدم جديد في الأسبوع الماضي`,
        type: 'success',
        time: 'منذ يوم',
        icon: 'UserOutlined'
      });
    }

    // فحص التقارير الجديدة
    const recentReports = await prisma.report.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // آخر أسبوع
        }
      }
    });

    if (recentReports > 0) {
      notifications.push({
        id: `new_reports_${Date.now()}`,
        title: 'تقارير جديدة',
        message: `تم إضافة ${recentReports} تقرير جديد في الأسبوع الماضي`,
        type: 'success',
        time: 'منذ يومين',
        icon: 'FileTextOutlined'
      });
    }

  } catch (error) {
    console.error('Error creating realistic notifications:', error);
  }

  return notifications;
}

// دالة لإنشاء إشعار عند إضافة مقال جديد
export const createArticleNotification = async (prisma, articleId, userId) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { section: true }
    });

    if (article) {
      await prisma.notification.create({
        data: {
          title: 'مقال جديد',
          message: `تم إضافة مقال جديد: "${article.title}"`,
          type: 'info',
          userId: userId
        }
      });
    }
  } catch (error) {
    console.error('Error creating article notification:', error);
  }
};

// دالة لإنشاء إشعار عند نشر مقال
export const createPublishNotification = async (prisma, articleId, userId) => {
  try {
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      include: { section: true }
    });

    if (article) {
      await prisma.notification.create({
        data: {
          title: 'مقال منشور',
          message: `تم نشر المقال: "${article.title}"`,
          type: 'success',
          userId: userId
        }
      });
    }
  } catch (error) {
    console.error('Error creating publish notification:', error);
  }
};

// دالة لإنشاء إشعار عند إنشاء نسخة احتياطية
export const createBackupNotification = async (prisma, backupType, userId) => {
  try {
    await prisma.notification.create({
      data: {
        title: 'نسخة احتياطية',
        message: `تم إنشاء نسخة احتياطية من نوع: ${backupType}`,
        type: 'success',
        userId: userId
      }
    });
  } catch (error) {
    console.error('Error creating backup notification:', error);
  }
};

// دالة لإنشاء إشعار عند تسجيل مستخدم جديد
export const createUserNotification = async (prisma, username, userId) => {
  try {
    await prisma.notification.create({
      data: {
        title: 'مستخدم جديد',
        message: `تم تسجيل مستخدم جديد: ${username}`,
        type: 'info',
        userId: userId
      }
    });
  } catch (error) {
    console.error('Error creating user notification:', error);
  }
}; 