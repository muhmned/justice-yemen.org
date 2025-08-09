const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');
const errorHandler = require('./middleware/errorHandler');
const basicInfoRoutes = require('./routes/basicInfoRoutes');
const sectionRoutes = require('./routes/sectionRoutes');
const backupRoutes = require('./routes/backupRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const statsRoutes = require('./routes/statsRoutes');
const dotenv = require('dotenv');
const errorLogger = require('./middleware/errorLogger');
const logActivity = require('./middleware/logActivity');

// تحميل متغيرات البيئة
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const app = express();
const prisma = require('./prisma');

// جعل PrismaClient متاحًا للراوترز

app.locals.prisma = prisma;


// إعدادات CORS محسنة
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'x-requested-with',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name'
  ]
}));

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// سجل كل طلب مع تفاصيله
app.use((req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url}`);
  if (Object.keys(req.body || {}).length > 0) {
    console.log('Body:', req.body);
  }
  next();
});

// نقطة فحص الصحة
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// نقطة فحص صحة الاتصال بقاعدة البيانات
app.get('/api/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ db: 'ok' });
  } catch (error) {
    res.status(500).json({ db: 'error', message: error.message });
  }
});

// Login endpoint
app.post('/api/auth/login', logActivity('login'), async (req, res) => {
  try {
    const { username, password } = req.body;

    // التحقق من وجود البيانات المطلوبة
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'يرجى إدخال اسم المستخدم وكلمة المرور' 
      });
    }

    // التحقق من طول البيانات
    if (username.length < 3) {
      return res.status(400).json({ 
        error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' 
      });
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      });
    }

    // Check password using bcrypt
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
      });
    }

    // التحقق من حالة المستخدم
    if (user.status !== 'active') {
      return res.status(401).json({ 
        error: 'حسابك غير مفعل. يرجى التواصل مع المدير' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        name: user.username,
        username: user.username,
        role: user.role 
      },
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
    res.status(500).json({ 
      error: 'حدث خطأ في الخادم. يرجى المحاولة مرة أخرى' 
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', logActivity('logout', 'auth', 'User logged out successfully.'), (req, res) => {
  // In a real-world scenario, you might want to invalidate the token.
  // For now, we just send a success message.
  res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
});

// Protected route example
app.get('/api/admin/dashboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    if (!['admin', 'system_admin'].includes(decoded.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get dashboard stats
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

// ربط الراوترات
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

// في نهاية جميع الراوتات:
app.use(errorLogger);
app.use(errorHandler);

// معالج أخطاء multer
app.use((error, req, res, next) => {
  console.error('خطأ في الخادم:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'حجم الملف كبير جداً. الحد الأقصى 2 ميجابايت' 
    });
  }
  
  if (error.message && error.message.includes('يسمح فقط بملفات الصور')) {
    return res.status(400).json({ 
      error: error.message 
    });
  }
  
  if (error.name === 'MulterError') {
    return res.status(400).json({ 
      error: 'خطأ في رفع الملف: ' + error.message 
    });
  }
  
  // إذا لم يكن خطأ معروف، استخدم معالج الأخطاء العام
  next(error);
});

// معالج أخطاء عام للطوارئ
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// تشغيل الخادم
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
