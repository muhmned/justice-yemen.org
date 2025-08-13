import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import corsConfig from './config/cors.js';
import userRoutes from './routes/userRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import newsRoutes from './routes/newsRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import statementRoutes from './routes/statementRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

import uploadRoutes from './routes/uploadRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import basicInfoRoutes from './routes/basicInfoRoutes.js';
import sectionRoutes from './routes/sectionRoutes.js';
import backupRoutes from './routes/backupRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import dotenv from 'dotenv';
import errorLogger from './middleware/errorLogger.js';
import logActivity from './middleware/logActivity.js';
import prisma from './prisma.js';
import renderConfig from './config/render.js';

// تحميل متغيرات البيئة
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

const app = express();

// جعل PrismaClient متاحًا للراوترز
app.locals.prisma = prisma;

// حل لمتغير __dirname في ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إعدادات CORS محسنة للعمل مع Render
app.use(corsConfig);

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
app.use('/api/backup', backupRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stats', statsRoutes);

// Serve static files from the React app build folder
app.use(express.static(path.join(__dirname, '../frontend/build')));

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
// This route should be placed after all API routes
// Express 5.x compatible catchall route using RegExp to avoid path-to-regexp parsing issues
app.get(/.*/, (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Skip uploads route
  if (req.path.startsWith('/uploads/')) {
    return res.status(404).json({ error: 'File not found' });
  }
  
  // Serve React app for all other routes (SPA routing)
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

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

// التحقق من إعدادات Render
try {
  renderConfig.validateConfig();
  console.log('📋 Render diagnostic info:', renderConfig.getDiagnosticInfo());
} catch (error) {
  console.error('❌ Render configuration error:', error.message);
  process.exit(1);
}

// تشغيل الخادم
const server = app.listen(renderConfig.port, renderConfig.host, () => {
  console.log(`🚀 Server running on ${renderConfig.host}:${renderConfig.port}`);
  console.log(`🌍 Environment: ${renderConfig.environment}`);
  console.log(`🔗 Health check: http://${renderConfig.host}:${renderConfig.port}/api/health`);
  console.log(`📊 Database check: http://${renderConfig.host}:${renderConfig.port}/api/health/db`);
  
  // معلومات إضافية للتشخيص
  if (renderConfig.environment === 'production') {
    console.log(`🌐 Production mode - External access enabled`);
    console.log(`🔧 Render deployment ready - Port binding on ${renderConfig.host}`);
    console.log(`📡 Ready to accept external connections`);
  } else {
    console.log(`🔧 Development mode - Local access only`);
  }
});

// معالجة إغلاق الخادم بشكل آمن
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});
