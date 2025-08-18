# نظام رفع الملفات المرن - دليل شامل

## نظرة عامة

تم تطوير نظام رفع ملفات مرن يدعم ثلاثة مزودات تخزين سحابية مختلفة:
- **Cloudinary** (الافتراضي) - مثالي للمشاريع الصغيرة والمتوسطة
- **Amazon S3** - موثوقية عالية وقابلية للتوسع
- **Supabase Storage** - تكامل مع قاعدة البيانات

## المميزات

✅ **مرونة كاملة**: التبديل بين المزودات بتغيير متغير واحد  
✅ **توافق تام**: لا يحتاج لتغيير في الكود الأمامي أو الخلفي  
✅ **أمان عالي**: دعم للمصادقة والصلاحيات  
✅ **أداء محسن**: استخدام الذاكرة المؤقتة لرفع الملفات  
✅ **دعم متعدد**: صور، PDF، ومستندات أخرى  

## الملفات المحدثة

### 1. الملفات الجديدة
- `src/utils/storageProvider.js` - مزود التخزين المركزي
- `env.example` - مثال لملف البيئة
- `STORAGE_SETUP.md` - دليل الإعداد
- `README_STORAGE_SYSTEM.md` - هذا الملف

### 2. الملفات المحدثة
- `src/routes/uploadRoutes.js` - نقطة رفع الملفات العامة
- `src/routes/articleRoutes.js` - رفع صور المقالات
- `src/routes/newsRoutes.js` - رفع صور الأخبار
- `src/routes/reportRoutes.js` - رفع التقارير والملفات
- `src/routes/settingRoutes.js` - رفع الشعار وصور الإعدادات
- `src/controllers/articleController.js` - معالجة صور المقالات
- `src/controllers/newsController.js` - معالجة صور الأخبار
- `src/controllers/reportController.js` - معالجة ملفات التقارير
- `package.json` - إضافة التبعيات الجديدة

## الإعداد السريع

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. نسخ ملف البيئة
```bash
cp env.example .env
```

### 3. تحديد مزود التخزين
```env
STORAGE_PROVIDER=cloudinary  # أو s3 أو supabase
```

### 4. إعداد بيانات الاعتماد

#### Cloudinary
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Amazon S3
```env
S3_BUCKET_NAME=your_bucket_name
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=your_region
```

#### Supabase
```env
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=uploads
```

## نقاط النهاية (Endpoints)

### 1. رفع ملف عام
```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: { file: <file> }
Response: { success: true, url: "https://..." }
```

### 2. رفع صور المقالات
```
POST /api/articles
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: { 
  title: "عنوان المقال",
  content: "محتوى المقال",
  sectionId: "section_id",
  image: <file> (اختياري)
}
```

### 3. رفع صور الأخبار
```
POST /api/news
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: {
  title: "عنوان الخبر",
  summary: "ملخص الخبر",
  content: "محتوى الخبر",
  image: <file> (اختياري)
}
```

### 4. رفع التقارير
```
POST /api/reports
Content-Type: multipart/form-data
Authorization: Bearer <token>

Body: {
  title: "عنوان التقرير",
  summary: "ملخص التقرير",
  content: "محتوى التقرير",
  pdfFile: <file> (اختياري),
  thumbnail: <file> (اختياري)
}
```

## التبديل بين المزودات

### من Cloudinary إلى S3
```env
STORAGE_PROVIDER=s3
S3_BUCKET_NAME=your_bucket
S3_ACCESS_KEY=your_key
S3_SECRET_KEY=your_secret
S3_REGION=us-east-1
```

### من S3 إلى Supabase
```env
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_key
SUPABASE_BUCKET=uploads
```

### العودة إلى Cloudinary
```env
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

## معالجة الأخطاء

### أخطاء شائعة وحلولها

#### 1. "مزود التخزين غير معروف"
```javascript
// تأكد من صحة القيمة في .env
STORAGE_PROVIDER=cloudinary  // ✅ صحيح
STORAGE_PROVIDER=Cloudinary  // ❌ خطأ
```

#### 2. "فشل في رفع الملف"
```javascript
// تحقق من بيانات الاعتماد
console.log('Storage Provider:', process.env.STORAGE_PROVIDER);
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY
});
```

#### 3. "خطأ في CORS" (لـ S3)
```json
// إعداد CORS في S3 bucket
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

## الأمان

### 1. حماية المفاتيح
- لا تشارك مفاتيح API في الكود العام
- استخدم متغيرات البيئة
- راجع صلاحيات الوصول بانتظام

### 2. التحقق من الملفات
```javascript
// التحقق من نوع الملف
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('نوع الملف غير مدعوم');
}

// التحقق من حجم الملف
const maxSize = 10 * 1024 * 1024; // 10MB
if (file.size > maxSize) {
  throw new Error('حجم الملف كبير جداً');
}
```

### 3. المصادقة والصلاحيات
```javascript
// جميع نقاط النهاية تتطلب مصادقة
authenticateToken, requireRole(['editor', 'admin', 'system_admin'])
```

## الأداء والتحسين

### 1. استخدام الذاكرة المؤقتة
```javascript
// multer.memoryStorage() بدلاً من diskStorage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
});
```

### 2. معالجة متوازية للملفات
```javascript
// رفع ملفات متعددة في نفس الوقت
const uploadPromises = files.map(file => uploadFile(file));
const urls = await Promise.all(uploadPromises);
```

### 3. ضغط الصور (Cloudinary)
```javascript
// إعدادات Cloudinary للضغط التلقائي
{
  resource_type: 'auto',
  folder: 'justice_org',
  use_filename: true,
  unique_filename: true
}
```

## الاختبار

### 1. اختبار رفع ملف
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test.jpg"
```

### 2. اختبار تبديل المزود
```bash
# تغيير STORAGE_PROVIDER في .env
# إعادة تشغيل الخادم
# اختبار رفع ملف جديد
```

### 3. اختبار الأداء
```bash
# قياس وقت رفع ملفات مختلفة الأحجام
# مراقبة استخدام الذاكرة
# اختبار التحميل المتوازي
```

## الدعم والصيانة

### 1. السجلات
```javascript
// مراقبة سجلات رفع الملفات
console.log('تم رفع الملف بنجاح:', fileUrl);
console.error('خطأ في رفع الملف:', error);
```

### 2. النسخ الاحتياطي
- احتفظ بنسخة من ملف `.env`
- راجع إعدادات المزودين بانتظام
- اختبر النظام بعد كل تحديث

### 3. التحديثات
```bash
# تحديث التبعيات
npm update

# فحص الأمان
npm audit

# اختبار النظام
npm test
```

## استكشاف الأخطاء

### 1. مشاكل الاتصال
```javascript
// فحص الاتصال بالمزود
try {
  await uploadFile(testFile);
  console.log('الاتصال يعمل بشكل صحيح');
} catch (error) {
  console.error('مشكلة في الاتصال:', error);
}
```

### 2. مشاكل الصلاحيات
```javascript
// فحص صلاحيات الوصول
console.log('User Role:', req.user.role);
console.log('Required Roles:', ['editor', 'admin', 'system_admin']);
```

### 3. مشاكل الذاكرة
```javascript
// مراقبة استخدام الذاكرة
const used = process.memoryUsage();
console.log('Memory Usage:', {
  rss: `${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`,
  heapTotal: `${Math.round(used.heapTotal / 1024 / 1024 * 100) / 100} MB`,
  heapUsed: `${Math.round(used.heapUsed / 1024 / 1024 * 100) / 100} MB`
});
```

## الخلاصة

تم تطوير نظام رفع ملفات مرن ومتطور يدعم:

- **ثلاثة مزودات تخزين** مختلفة
- **تبديل سهل** بين المزودين
- **أمان عالي** ومصادقة
- **أداء محسن** باستخدام الذاكرة المؤقتة
- **توافق تام** مع النظام الحالي

النظام جاهز للاستخدام الفوري ولا يحتاج لأي تغييرات في الكود الأمامي أو الخلفي الموجود.

