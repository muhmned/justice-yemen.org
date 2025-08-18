# إعداد Cloudinary لرفع الملفات

## 🔹 المتطلبات المحدثة

### 1. تحديث ملف `.env` في مجلد `backend`

أضف المتغيرات التالية إلى ملف `.env`:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Storage Provider (cloudinary or local)
STORAGE_PROVIDER="cloudinary"
```

### 2. الحصول على بيانات Cloudinary

1. اذهب إلى [Cloudinary](https://cloudinary.com/)
2. أنشئ حساب مجاني
3. من لوحة التحكم، احصل على:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. تثبيت التبعيات

```bash
cd backend
npm install
```

## 🔹 كيفية عمل النظام

### 1. رفع الملفات (`/api/upload`)

- **المدخلات**: FormData مع ملف
- **المخرجات**: JSON يحتوي على `{ success: true, url: "..." }`
- **الخدمة**: Cloudinary (أو التخزين المحلي كاحتياطي)

### 2. المسارات الجديدة في `storyRoutes.js`

#### تقارير
- `POST /api/reports` - إنشاء تقرير
- `PUT /api/reports/:id` - تعديل تقرير

#### مقالات
- `POST /api/articles` - إنشاء مقال
- `PUT /api/articles/:id` - تعديل مقال

#### أخبار
- `POST /api/news` - إنشاء خبر
- `PUT /api/news/:id` - تعديل خبر

## 🔹 تحديثات Frontend

### 1. AddReport.js ✅
- تم تحديث `handleSubmit` ليرسل إلى `/api/reports`
- `images_upload_handler` يرفع الصور إلى `/api/upload`

### 2. EditReport.js ✅
- يستخدم `PUT /api/reports/:id`
- `images_upload_handler` يعمل بشكل صحيح

### 3. AddArticle.js ✅
- يستخدم `POST /api/articles`
- يدعم رفع الصور

### 4. EditArticle.js ✅
- يستخدم `PUT /api/articles/:id`

### 5. AddNews.js ✅
- يستخدم `POST /api/news`

### 6. EditNews.js ✅
- يستخدم `PUT /api/news/:id`

## 🔹 TinyMCE Integration

جميع المحررات تستخدم:
```javascript
images_upload_handler: async (blobInfo, success, failure) => {
  const formData = new FormData();
  formData.append('file', blobInfo.blob());
  try {
    const token = localStorage.getItem('admin_token');
    const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (data && data.url) {
      success(data.url);
    } else {
      failure('فشل رفع الصورة');
    }
  } catch (e) {
    failure('فشل الاتصال بالخادم');
  }
}
```

## 🔹 الخلاصة

✅ **تم تحديث Backend:**
- `uploadRoutes.js` - يدعم Cloudinary
- `storyRoutes.js` - مسارات جديدة للتقارير/المقالات/الأخبار
- `package.json` - إضافة Cloudinary dependency

✅ **تم تحديث Frontend:**
- جميع ملفات الإضافة والتعديل تستخدم المسارات الصحيحة
- TinyMCE يرفع الصور إلى `/api/upload`

✅ **المسارات النهائية:**
- `/api/upload` = رفع الملفات (إرجاع رابط)
- `/api/reports` = تخزين بيانات التقرير
- `/api/articles` = تخزين بيانات المقال
- `/api/news` = تخزين بيانات الخبر

## 🔹 ملاحظات مهمة

1. **التخزين المحلي كاحتياطي**: إذا فشل Cloudinary، سيستخدم النظام التخزين المحلي
2. **الأمان**: جميع المسارات تتطلب مصادقة
3. **التوافق**: النظام يعمل مع Render بدون مشاكل
4. **المرونة**: يمكن التبديل بين Cloudinary والتخزين المحلي عبر `STORAGE_PROVIDER`
