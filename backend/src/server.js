const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

const userRoutes = require('./routes/userRoutes');
const articleRoutes = require('./routes/articleRoutes');
const newsRoutes = require('./routes/newsRoutes');
const reportRoutes = require('./routes/reportRoutes');
const statementRoutes = require('./routes/statementRoutes');
const storyRoutes = require('./routes/storyRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const settingRoutes = require('./routes/settingRoutes');
const contactRoutes = require('./routes/contactRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const basicInfoRoutes = require('./routes/basicInfoRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const backupRoutes = require('./routes/backupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');

const errorHandler = require('./middleware/errorHandler');
const errorLogger = require('./middleware/errorLogger');
const logActivity = require('./middleware/logActivity');

dotenv.config();

const app = express();
const prisma = require('./prisma');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

// جعل PrismaClient متاحًا
app.locals.prisma = prisma;

// إعدادات CORS
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 
    'Cache-Control', 'X-File-Name'
  ]
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// تسجيل الطلبات
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  if (Object.keys(req.body || {}).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ db: 'ok' });
  } catch (error) {
    res.status(500).json({ db: 'error', message: error.message });
  }
});

// Login
app.post('/api/auth/login', logActivity('login'), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ error: 'حسابك غير مفعل. يرجى التواصل مع المدير' });
    }

    const token = jwt.sign(
      { userId: user.id, name: user.username, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      message: 'تم تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى' });
  }
});

// Logout
app.post('/api/auth/logout', logActivity('logout', 'auth', 'User logged out successfully.'), (req, res) => {
  res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
});

// Admin dashboard
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, JWT_SECRET);
    if (!['admin', 'system_admin'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const stats = await prisma.$transaction([
      prisma.article.count(),
      prisma.report.count(),
      prisma.story.count(),
      prisma.user.count(),
      prisma.section.count()
    ]);

    res.json({
      stats: {
        articles: stats[0],
        reports: stats[1],
        stories: stats[2],
        users: stats[3],
        sections: stats[4]
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/statements', statementRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/api/upload', uploadRoutes);
app.use('/api/basic-info', basicInfoRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api', backupRoutes);
app.use('/api', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

// تقديم الـ frontend في الإنتاج
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Middleware للأخطاء
app.use(errorLogger);
app.use(errorHandler);

app.use((error, req, res, next) => {
  console.error('خطأ في الخادم:', error);
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت' });
  }
  if (error.message?.includes('يسمح فقط بملفات الصور')) {
    return res.status(400).json({ error: error.message });
  }
  if (error.name === 'MulterError') {
    return res.status(400).json({ error: 'خطأ في رفع الملف: ' + error.message });
  }
  next(error);
});

// التعامل مع أخطاء Node
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
