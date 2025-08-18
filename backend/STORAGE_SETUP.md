# إعداد نظام رفع الملفات المرن

هذا النظام يدعم ثلاثة مزودات تخزين سحابية مختلفة لرفع الملفات:

## المزودات المدعومة

### 1. Cloudinary (الافتراضي)
- **المميزات**: معالجة الصور، تحويل التنسيقات، تحسين الحجم
- **الاستخدام**: مثالي للمشاريع الصغيرة والمتوسطة

### 2. Amazon S3
- **المميزات**: موثوقية عالية، تكلفة منخفضة، قابلية التوسع
- **الاستخدام**: مثالي للمشاريع الكبيرة والمنتجات التجارية

### 3. Supabase Storage
- **المميزات**: تكامل مع قاعدة البيانات، سهولة الاستخدام
- **الاستخدام**: مثالي عند استخدام Supabase كقاعدة بيانات

## الإعداد

### الخطوة 1: نسخ ملف البيئة
```bash
cp env.example .env
```

### الخطوة 2: تحديد مزود التخزين
في ملف `.env`، حدد مزود التخزين المطلوب:
```env
STORAGE_PROVIDER=cloudinary  # أو s3 أو supabase
```

### الخطوة 3: إعداد Cloudinary

1. إنشاء حساب في [Cloudinary](https://cloudinary.com/)
2. الحصول على بيانات الاعتماد من لوحة التحكم
3. إضافة البيانات إلى `.env`:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### الخطوة 4: إعداد Amazon S3

1. إنشاء حساب AWS
2. إنشاء bucket جديد
3. إنشاء IAM user مع صلاحيات S3
4. إضافة البيانات إلى `.env`:
```env
S3_BUCKET_NAME=your_bucket_name
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_REGION=your_region
```

### الخطوة 5: إعداد Supabase Storage

1. إنشاء مشروع في [Supabase](https://supabase.com/)
2. إنشاء bucket جديد في Storage
3. الحصول على Service Role Key
4. إضافة البيانات إلى `.env`:
```env
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_BUCKET=uploads
```

## التبديل بين المزودات

لتغيير مزود التخزين، ما عليك سوى تغيير قيمة `STORAGE_PROVIDER` في ملف `.env`:

```env
# للتبديل إلى S3
STORAGE_PROVIDER=s3

# للتبديل إلى Supabase
STORAGE_PROVIDER=supabase

# للعودة إلى Cloudinary
STORAGE_PROVIDER=cloudinary
```

## تثبيت التبعيات

```bash
npm install
```

## الاستخدام

النظام يعمل تلقائياً مع جميع مزودات التخزين. لا تحتاج لتغيير أي شيء في الكود الأمامي أو الخلفي عند التبديل بين المزودات.

### مثال الاستخدام:
```javascript
// رفع ملف
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/api/upload', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});

const result = await response.json();
console.log('رابط الملف:', result.url);
```

## ملاحظات مهمة

1. **الأمان**: تأكد من عدم مشاركة مفاتيح API في الكود العام
2. **النسخ الاحتياطي**: احتفظ بنسخة من ملف `.env` في مكان آمن
3. **الاختبار**: اختبر النظام مع كل مزود قبل النشر
4. **التكلفة**: راقب استخدام التخزين السحابي لتجنب التكاليف غير المتوقعة

## استكشاف الأخطاء

### خطأ "مزود التخزين غير معروف"
- تأكد من صحة قيمة `STORAGE_PROVIDER` في ملف `.env`
- القيم المدعومة: `cloudinary`, `s3`, `supabase`

### خطأ في رفع الملفات
- تأكد من صحة بيانات الاعتماد
- تحقق من صلاحيات الوصول للملفات
- راجع سجلات الخطأ في وحدة التحكم

### مشاكل في CORS (للـ S3)
- تأكد من إعداد CORS في إعدادات bucket
- راجع إعدادات السياسات العامة

