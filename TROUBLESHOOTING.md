# دليل استكشاف الأخطاء - النسخ الاحتياطية

## 🚨 المشكلة: "حدث خطأ بالاتصال بالخادم"

### الحلول السريعة:

#### 1. تحقق من تشغيل الخوادم
```bash
# تحقق من الباك إند
curl http://localhost:5000/api/health

# تحقق من الفرونت إند
curl http://localhost:3000
```

#### 2. إعادة تشغيل الخوادم
```bash
# إيقاف الخوادم (Ctrl+C)
# ثم إعادة التشغيل

# الباك إند
cd backend
npm run dev

# الفرونت إند (في terminal جديد)
cd frontend
npm start
```

#### 3. تحقق من الـ Token
- افتح Developer Tools (F12)
- اذهب إلى Application → Local Storage
- تحقق من وجود `admin_token`
- إذا لم يكن موجود، سجل دخول مرة أخرى

#### 4. تحقق من قاعدة البيانات
```bash
# في مجلد backend
npx prisma generate
npx prisma db push
```

### 🔍 تشخيص المشكلة:

#### الخطوة 1: فحص الخادم
```bash
curl http://localhost:5000/api/health
```
**النتيجة المتوقعة**: `{"status":"ok"}`

#### الخطوة 2: فحص قاعدة البيانات
```bash
curl http://localhost:5000/api/health/db
```
**النتيجة المتوقعة**: `{"db":"ok"}`

#### الخطوة 3: فحص الـ Token
```javascript
// في console المتصفح
console.log(localStorage.getItem('admin_token'));
```
**النتيجة المتوقعة**: token طويل

### 🛠️ حلول إضافية:

#### مشكلة: "No token found"
**الحل**: سجل دخول مرة أخرى في لوحة الإدارة

#### مشكلة: "Database connection failed"
**الحل**: 
1. تأكد من تشغيل PostgreSQL
2. تحقق من ملف `.env`
3. أعد تشغيل الباك إند

#### مشكلة: "CORS error"
**الحل**:
1. تأكد من أن الفرونت إند يعمل على المنفذ 3000
2. تأكد من أن الباك إند يعمل على المنفذ 5000
3. تحقق من إعدادات CORS في `server.js`

#### مشكلة: "Permission denied"
**الحل**:
```bash
# إنشاء مجلد النسخ الاحتياطية
mkdir -p backend/backups
chmod 755 backend/backups
```

### 📋 قائمة التحقق:

- [ ] الباك إند يعمل على المنفذ 5000
- [ ] الفرونت إند يعمل على المنفذ 3000
- [ ] قاعدة البيانات متصلة
- [ ] الـ token موجود في localStorage
- [ ] مجلد backups موجود
- [ ] صلاحيات الكتابة متاحة

### 🆘 إذا لم تحل المشكلة:

1. **تحقق من سجلات الأخطاء**:
   ```bash
   # سجلات الباك إند
   tail -f backend/error.log
   ```

2. **تحقق من console المتصفح**:
   - افتح Developer Tools (F12)
   - اذهب إلى Console
   - ابحث عن أخطاء

3. **تحقق من Network tab**:
   - افتح Developer Tools (F12)
   - اذهب إلى Network
   - حاول إنشاء نسخة احتياطية
   - تحقق من الطلبات الفاشلة

### 📞 للحصول على مساعدة إضافية:

1. انسخ رسالة الخطأ كاملة
2. التقط screenshot من console المتصفح
3. شارك محتوى ملف error.log
4. وصف الخطوات التي أدت للمشكلة

---

**نصيحة**: جرب دائماً إعادة تشغيل الخوادم أولاً، فهذا يحل معظم المشاكل! 🔄 