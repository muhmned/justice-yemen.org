# اختبار الوصول لإدارة الأخبار

## الخطوات:

### 1. تأكد من تشغيل الخوادم:
```bash
# الخادم الخلفي (Terminal 1)
cd backend
npm start

# الواجهة الأمامية (Terminal 2)  
cd frontend
npm start
```

### 2. الوصول للوحة التحكم:
- افتح المتصفح: `http://localhost:3000`
- اذهب إلى: `http://localhost:3000/admin`
- سجل الدخول بـ:
  - اسم المستخدم: `admin`
  - كلمة المرور: `123456789`

### 3. الوصول لإدارة الأخبار:
- من القائمة الجانبية: **إدارة المحتوى** → **الأخبار**
- أو مباشرة: `http://localhost:3000/admin/news`

### 4. اختبار الوظائف:
- ✅ عرض قائمة الأخبار (فارغة في البداية)
- ✅ إضافة خبر جديد: `http://localhost:3000/admin/add-news`
- ✅ تعديل خبر موجود
- ✅ حذف خبر
- ✅ معاينة الخبر

### 5. إذا واجهت مشكلة:
1. تحقق من تشغيل الخوادم
2. تحقق من تسجيل الدخول
3. تحقق من console المتصفح للأخطاء
4. تحقق من terminal الخوادم للأخطاء

## API Endpoints المتاحة:
- `GET /api/news` - جلب جميع الأخبار
- `GET /api/news/:id` - جلب خبر محدد
- `POST /api/news` - إضافة خبر جديد
- `PUT /api/news/:id` - تحديث خبر
- `DELETE /api/news/:id` - حذف خبر

## الملفات المهمة:
- `frontend/src/pages/admin/NewsManagement.js` - صفحة إدارة الأخبار
- `frontend/src/pages/admin/AddNews.js` - صفحة إضافة خبر
- `frontend/src/pages/admin/EditNews.js` - صفحة تعديل خبر
- `backend/src/controllers/newsController.js` - منطق الأعمال
- `backend/src/routes/newsRoutes.js` - مسارات API 