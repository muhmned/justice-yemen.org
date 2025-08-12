import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const { status } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        permissions: true,
        status: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  // Basic validation
  if (!['editor', 'admin', 'system_admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role specified.' });
  }

  // Prevent a user from changing their own role
  if (req.user.id === userId) {
    return res.status(403).json({ error: "You cannot change your own role." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { username, email, password, role, status } = req.body;
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
        status,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create user' });
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const { username, email, password, role, status } = req.body;
  try {
    const data = { username, email, role, status };
    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update user' });
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  try {
    await prisma.user.delete({ where: { id: userId } });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: 'Failed to delete user' });
  }
};

const getMe = async (req, res) => {
  // req.user is populated by the authenticateToken middleware
  if (req.user) {
    try {
      // جلب بيانات المستخدم الكاملة من قاعدة البيانات
      const fullUserData = await prisma.user.findUnique({
        where: { id: req.user.id }
      });

      if (fullUserData) {
        // تحويل البيانات إلى التنسيق المطلوب في الواجهة الأمامية
        const userDataForFrontend = {
          id: fullUserData.id,
          username: fullUserData.username,
          email: fullUserData.email,
          name: fullUserData.username,
          role: fullUserData.role,
          permissions: fullUserData.permissions,
          createdAt: fullUserData.createdAt,
          status: fullUserData.status,
          bio: fullUserData.bio
        };
        
        res.json(userDataForFrontend);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  } else {
    res.status(404).json({ error: 'User not found' });
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  const { userId } = req.params;
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    return res.status(400).json({ error: 'Invalid status specified.' });
  }

  if (req.user.id === userId) {
    return res.status(403).json({ error: "You cannot change your own status." });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};

const updateUserPermissions = async (req, res) => {
  const { userId } = req.params;
  const { permissions } = req.body;

  if (typeof permissions !== 'object' || permissions === null) {
    return res.status(400).json({ error: 'Invalid permissions format. Should be an object.' });
  }

  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { permissions },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        permissions: true,
      },
    });
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user permissions:', error);
    res.status(500).json({ error: 'Failed to update user permissions.' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  const { name, email, username, bio } = req.body;
  
  try {
    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        name: name,
        email,
      }
    });

    // تحويل البيانات إلى التنسيق المطلوب في الواجهة الأمامية
    const userDataForFrontend = {
      id: updatedUser.id,
      username: updatedUser.name,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.roleId,
      permissions: null,
      createdAt: updatedUser.createdAt,
      status: updatedUser.isActive ? 'active' : 'inactive',
      bio: null
    };

    res.json(userDataForFrontend);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Change user password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    // جلب المستخدم مع كلمة المرور للتحقق
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // التحقق من كلمة المرور الحالية
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: 'كلمة المرور الحالية غير صحيحة' });
    }

    // تشفير كلمة المرور الجديدة
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // تحديث كلمة المرور المشفرة
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        passwordHash: hashedNewPassword
      }
    });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  let { userId } = req.params;
  console.log('userId من الـ params:', userId);
  console.log('نوع userId من الـ params:', typeof userId);
  
  // لا نحول userId إلى رقم لأنه String في قاعدة البيانات
  
  try {
    console.log('دور المستخدم في الطلب:', req.user.role);
    console.log('ID المستخدم المطلوب:', userId);
    console.log('ID المستخدم الحالي:', req.user.id);
    console.log('نوع ID المستخدم المطلوب:', typeof userId);
    console.log('نوع ID المستخدم الحالي:', typeof req.user.id);
    console.log('هل متساويان؟', req.user.id === userId);
    
    // منع المستخدمين من جلب إحصائيات غيرهم
    if (req.user.id !== userId) {
      return res.status(403).json({ error: 'غير مصرح لك بعرض إحصائيات مستخدم آخر' });
    }

    // جلب مقالات المستخدم المحدد فقط
    let where = {};
    if (userId) {
      where = { userId: userId };
    }
    console.log('جلب مقالات المستخدم:', userId);
    console.log('شرط البحث:', where);
    
    const articles = await prisma.article.findMany({
      where,
      select: {
        id: true,
        title: true,
        content: true,
        publishDate: true,
        createdAt: true,
        userId: true
      }
    });

    console.log('عدد المقالات المجلوبة:', articles.length);
    if (articles.length > 0) {
      console.log('أول مقال:', articles[0].title, 'للمستخدم:', articles[0].userId);
    }

    // Calculate statistics
    const totalArticles = articles.length;
    const publishedArticles = articles.filter(article => article.publishDate !== null).length;
    const draftArticles = totalArticles - publishedArticles;
    
    // Calculate total views, likes, comments (currently not implemented in schema)
    const totalViews = 0; // سيتم إضافة هذا لاحقاً عند إضافة جدول المشاهدات
    const totalLikes = 0; // سيتم إضافة هذا لاحقاً عند إضافة جدول الإعجابات
    const totalComments = 0; // سيتم إضافة هذا لاحقاً عند إضافة جدول التعليقات

    // جلب عدد الأخبار والتقارير الخاصة بالمستخدم
    let newsCount = 0;
    let reportsCount = 0;
    
    console.log('جلب عدد الأخبار للمستخدم:', userId);
    try {
      newsCount = await prisma.news.count({ where: { userId: userId } });
      console.log('عدد الأخبار:', newsCount);
    } catch (error) {
      console.error('خطأ في جلب عدد الأخبار:', error);
    }
    
    console.log('جلب عدد التقارير للمستخدم:', userId);
    try {
      reportsCount = await prisma.report.count({ where: { userId: userId } });
      console.log('عدد التقارير:', reportsCount);
    } catch (error) {
      console.error('خطأ في جلب عدد التقارير:', error);
    }

    // Get recent activity (last 10 activities)
    const recentActivity = articles
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(article => {
        const activity = {
          id: article.id,
          type: 'article_created',
          title: 'أضاف مقال جديد',
          description: `تم إنشاء مقال "${article.title}"`,
          date: new Date(article.createdAt)
        };

        if (article.publishDate) {
          activity.type = 'article_published';
          activity.title = 'نشر مقال';
          activity.description = `تم نشر مقال "${article.title}"`;
          activity.date = new Date(article.publishDate);
        }

        return activity;
      });

    // جلب التقارير للمستخدم وإضافتها للنشاط الأخير
    const userReports = await prisma.report.findMany({
      where: { userId: userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        publishDate: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const reportActivities = userReports.map(report => {
      const activity = {
        id: report.id,
        type: 'report_created',
        title: 'أضاف تقرير جديد',
        description: `تم إنشاء تقرير "${report.title}"`,
        date: new Date(report.createdAt)
      };

      if (report.publishDate) {
        activity.type = 'report_published';
        activity.title = 'نشر تقرير';
        activity.description = `تم نشر تقرير "${report.title}"`;
        activity.date = new Date(report.publishDate);
      }

      return activity;
    });

    // دمج المقالات والتقارير وترتيبها حسب التاريخ
    const allActivities = [...recentActivity, ...reportActivities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    const stats = {
      totalArticles,
      publishedArticles,
      draftArticles,
      totalViews,
      totalLikes,
      totalComments,
      newsCount,
      reportsCount,
      recentActivity: allActivities
    };

    console.log('الإحصائيات المرسلة:', stats);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to fetch user statistics.',
      details: error.message 
    });
  }
};

export {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  updateUserPermissions,
  getMe,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateProfile,
  changePassword,
};
