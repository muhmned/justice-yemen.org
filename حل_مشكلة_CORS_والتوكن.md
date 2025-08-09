# حل مشكلة CORS والتوكن في رفع الملفات

## 🔍 المشاكل المكتشفة

### 1. مشكلة CORS
```
Access to XMLHttpRequest at 'http://localhost:5000/api/upload' from origin 'http://localhost:3000' has been blocked by CORS policy: Request header field x-requested-with is not allowed by Access-Control-Allow-Headers in preflight response.
```

### 2. مشكلة التوكن
```
POST http://localhost:5000/api/upload net::ERR_FAILED
```

## 🛠️ الحلول المطبقة

### 1. إصلاح إعدادات CORS

#### في `backend/src/server.js`:
```javascript
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
```

### 2. تحسين إعدادات رفع الملفات

#### في `frontend/src/pages/admin/AddReport.js`:
```javascript
const uploadProps = {
  name: 'file',
  action: 'http://localhost:5000/api/upload',
  showUploadList: false,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
    'X-Requested-With': 'XMLHttpRequest'
  },
  beforeUpload: (file) => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      message.error('يرجى تسجيل الدخول أولاً');
      return false;
    }
    return true;
  },
  onError: (error) => {
    console.error('خطأ في رفع الملف:', error);
    message.error('فشل رفع الملف. تحقق من الاتصال أو الصلاحيات.');
  }
};
```

### 3. تحسين معالجة الأخطاء في الخادم

#### في `backend/src/routes/uploadRoutes.js`:
```javascript
router.post('/', authenticateToken, requireRole(['editor', 'admin', 'system_admin']), upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم رفع أي ملف' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    console.log('تم رفع الملف بنجاح:', req.file.originalname, '->', fileUrl);
    
    res.json({ 
      success: true, 
      url: fileUrl, 
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error('خطأ في رفع الملف:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء رفع الملف' });
  }
});
```

## 🔧 خطوات التحقق

### 1. تأكد من تشغيل الخادم
```bash
# في مجلد backend
npm start
```

### 2. تأكد من تسجيل الدخول
- اذهب إلى صفحة تسجيل الدخول
- سجل دخولك كـ admin
- تأكد من حفظ التوكن في localStorage

### 3. اختبر رفع ملف
- اذهب إلى صفحة إضافة تقرير
- حاول رفع صورة صغيرة (أقل من 1 ميجابايت)
- تحقق من رسائل النجاح/الخطأ

### 4. تحقق من سجلات الخادم
```bash
# راقب سجلات الخادم للأخطاء
tail -f backend/error.log
```

## 🧪 اختبار التوكن

### تشغيل الاختبار:
```bash
node test_token_check.js
```

### النتائج المتوقعة:
- ✅ تسجيل الدخول: 200
- ✅ رفع بدون ملف: 400
- ✅ رفع بدون توكن: 401
- ✅ رفع بتوكن خاطئ: 401

## 🚨 استكشاف الأخطاء

### إذا استمرت مشكلة CORS:

1. **تحقق من إعدادات المتصفح**:
   - افتح Developer Tools
   - اذهب إلى Network tab
   - راقب طلبات OPTIONS

2. **تحقق من إعدادات الخادم**:
   - تأكد من تشغيل الخادم على المنفذ 5000
   - تحقق من إعدادات CORS

3. **اختبر مع curl**:
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.jpg"
```

### إذا استمرت مشكلة التوكن:

1. **تحقق من localStorage**:
```javascript
// في console المتصفح
console.log(localStorage.getItem('admin_token'));
```

2. **تحقق من صلاحية التوكن**:
```javascript
// في console المتصفح
fetch('http://localhost:5000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
  }
}).then(r => r.json()).then(console.log);
```

3. **أعد تسجيل الدخول**:
- امسح localStorage
- سجل دخولك مرة أخرى

## ✅ النتيجة المتوقعة

بعد تطبيق هذه الإصلاحات:
- ✅ لا توجد أخطاء CORS
- ✅ رفع الملفات يعمل بشكل صحيح
- ✅ التوكن يتم إرساله بشكل صحيح
- ✅ رسائل خطأ واضحة ومفيدة

## 🔄 في حالة استمرار المشكلة

1. **أعد تشغيل الخادم**:
```bash
# أوقف الخادم (Ctrl+C)
# ثم أعد تشغيله
npm start
```

2. **أعد تشغيل المتصفح**:
- أغلق المتصفح تماماً
- أعد فتحه
- اذهب إلى التطبيق

3. **تحقق من إعدادات الشبكة**:
- تأكد من عدم وجود proxy
- تأكد من عدم وجود firewall يمنع الاتصال 