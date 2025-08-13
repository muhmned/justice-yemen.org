# دليل نشر التطبيق على Render

## المشكلة الأصلية
عند نشر خادم Node.js/Express على Render، يعمل الخادم بنجاح ولكن لا يمكن الوصول إليه من الخارج (مثل الأجهزة المحمولة) لأن `app.listen()` لا يرتبط بالـ host الصحيح.

## الحلول المطبقة

### 1. إعدادات الخادم المحسنة
- تم تحديث `app.listen()` ليرتبط بـ `'0.0.0.0'` بدلاً من `localhost`
- إضافة متغيرات بيئة `HOST` و `NODE_ENV`
- معالجة آمنة لإغلاق الخادم

### 2. إعدادات CORS محسنة
- إنشاء ملف `config/cors.js` منفصل
- دعم النطاقات المتعددة (development و production)
- دعم wildcards للـ Render preview URLs
- السماح بالطلبات بدون origin (للأجهزة المحمولة)

### 3. متغيرات البيئة المطلوبة
```yaml
# في render.yaml
envVars:
  - key: DATABASE_URL
    sync: false
  - key: JWT_SECRET
    sync: false
  - key: PORT
    value: 5000
  - key: NODE_ENV
    value: production
  - key: HOST
    value: 0.0.0.0
```

## خطوات النشر

### 1. تحديث النطاقات المسموح بها
في ملف `backend/src/config/cors.js`، قم بتحديث `allowedOrigins`:

```javascript
const allowedOrigins = [
  // Development origins
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  
  // Production origins - استبدل هذه بأسماء النطاقات الخاصة بك
  'https://justice-org.onrender.com', // استبدل باسم التطبيق الخاص بك
  'https://your-custom-domain.com',   // إذا كان لديك نطاق مخصص
  
  // Render preview URLs (for testing)
  'https://*.onrender.com'
];
```

### 2. إعداد متغيرات البيئة في Render
1. اذهب إلى لوحة تحكم Render
2. اختر مشروعك
3. اذهب إلى Environment Variables
4. أضف المتغيرات التالية:
   - `DATABASE_URL`: رابط قاعدة البيانات
   - `JWT_SECRET`: مفتاح JWT
   - `NODE_ENV`: production
   - `HOST`: 0.0.0.0

### 3. إعادة نشر التطبيق
```bash
git add .
git commit -m "Fix external access for Render deployment"
git push
```

## اختبار الوصول الخارجي

### 1. اختبار من المتصفح
```
https://your-app-name.onrender.com/api/health
```

### 2. اختبار من الأجهزة المحمولة
```javascript
// في تطبيق React Native أو Flutter
const response = await fetch('https://your-app-name.onrender.com/api/health');
const data = await response.json();
console.log(data);
```

### 3. اختبار من Postman
- Method: GET
- URL: `https://your-app-name.onrender.com/api/health`
- Headers: لا حاجة لـ headers خاصة

## استكشاف الأخطاء

### 1. إذا كان الخادم لا يستجيب
```bash
# تحقق من سجلات Render
# اذهب إلى لوحة تحكم Render > مشروعك > Logs
```

### 2. إذا كانت هناك مشاكل CORS
```javascript
// تحقق من سجلات الخادم
// ستظهر رسائل مثل: "CORS blocked origin: https://example.com"
```

### 3. إذا كانت قاعدة البيانات لا تعمل
```bash
# اختبر الاتصال بقاعدة البيانات
curl https://your-app-name.onrender.com/api/health/db
```

### 4. مشاكل شائعة وحلولها

#### المشكلة: الخادم يعمل محلياً ولكن لا يعمل على Render
**الحل:**
- تأكد من أن `HOST` مضبوط على `0.0.0.0`
- تأكد من أن `NODE_ENV` مضبوط على `production`

#### المشكلة: CORS errors في المتصفح
**الحل:**
- تحقق من `allowedOrigins` في `config/cors.js`
- أضف نطاق التطبيق الخاص بك إلى القائمة

#### المشكلة: الخادم يغلق فجأة
**الحل:**
- تحقق من متغيرات البيئة
- تأكد من أن `DATABASE_URL` صحيح
- تحقق من سجلات الأخطاء في Render

## نصائح إضافية

### 1. تحسين الأداء
```javascript
// في server.js
app.use(express.json({ limit: '10mb' })); // تقليل الحد الأقصى
app.use(express.urlencoded({ limit: '10mb', extended: true }));
```

### 2. إضافة compression
```bash
npm install compression
```

```javascript
// في server.js
import compression from 'compression';
app.use(compression());
```

### 3. إضافة rate limiting
```bash
npm install express-rate-limit
```

```javascript
// في server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 100 // حد أقصى 100 طلب لكل IP
});

app.use(limiter);
```

## مراقبة التطبيق

### 1. سجلات Render
- اذهب إلى لوحة تحكم Render > مشروعك > Logs
- راقب الأخطاء والتحذيرات

### 2. اختبارات الصحة
```bash
# اختبار الصحة العامة
curl https://your-app-name.onrender.com/api/health

# اختبار قاعدة البيانات
curl https://your-app-name.onrender.com/api/health/db
```

### 3. أدوات المراقبة
- استخدم أدوات مثل UptimeRobot لمراقبة توفر التطبيق
- إعداد تنبيهات للأخطاء

## الخلاصة

بعد تطبيق هذه التحديثات، يجب أن يكون خادمك قابلاً للوصول من الخارج على Render. النقاط الرئيسية:

1. ✅ `app.listen()` يرتبط بـ `'0.0.0.0'`
2. ✅ إعدادات CORS تدعم النطاقات الخارجية
3. ✅ متغيرات البيئة مضبوطة بشكل صحيح
4. ✅ معالجة آمنة لإغلاق الخادم

إذا استمرت المشكلة، تحقق من:
- سجلات Render للأخطاء
- إعدادات Firewall أو Security Groups
- تكوين قاعدة البيانات
- متغيرات البيئة
