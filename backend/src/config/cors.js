import cors from 'cors';

// قائمة النطاقات المسموح بها
const allowedOrigins = [
  // Development origins
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  
  // Production origins - استبدل هذه بأسماء النطاقات الخاصة بك
  'https://justice-org.onrender.com',
  'https://your-custom-domain.com',
  
  // Render preview URLs (for testing)
  'https://*.onrender.com'
];

// دالة للتحقق من النطاق
const originChecker = (origin, callback) => {
  // السماح بالطلبات بدون origin (مثل mobile apps أو Postman)
  if (!origin) {
    return callback(null, true);
  }
  
  // التحقق من النطاقات المسموح بها
  const isAllowed = allowedOrigins.some(allowedOrigin => {
    if (allowedOrigin.includes('*')) {
      // للتعامل مع wildcards مثل *.onrender.com
      const pattern = allowedOrigin.replace('*', '.*');
      return new RegExp(pattern).test(origin);
    }
    return allowedOrigin === origin;
  });
  
  if (isAllowed) {
    callback(null, true);
  } else {
    console.log(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  }
};

// إعدادات CORS
const corsOptions = {
  origin: originChecker,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'x-requested-with',
    'Accept',
    'Origin',
    'Cache-Control',
    'X-File-Name',
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Headers',
    'Access-Control-Allow-Methods'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200 // بعض المتصفحات القديمة تحتاج هذا
};

export default cors(corsOptions);
