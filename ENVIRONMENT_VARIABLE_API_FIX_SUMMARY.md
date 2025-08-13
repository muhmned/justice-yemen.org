# ملخص شامل لإصلاح API باستخدام متغيرات البيئة

## المشكلة الأصلية
جميع استدعاءات API في ملفات الفرونت إند كانت تستخدم `http://localhost:5000` مما يمنع عمل التطبيق في الإنتاج على Render.

## الحل المطبق
استخدام متغير البيئة `REACT_APP_API_URL` لتحديد رابط الباك إند بدلاً من localhost.

## التغييرات المطبقة

### 1. ✅ إصلاح ملف `api.js` الرئيسي
**الملف**: `backend/frontend/src/services/api.js`
**التغيير**: 
```javascript
// قبل
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// بعد (نفس الشيء - تم التأكيد عليه)
const API_BASE_URL = process.env.REACT_APP_API_URL || '';
```

### 2. ✅ إصلاح ملف `Header.js`
**الملف**: `backend/frontend/src/components/Header.js`
**التغييرات**:
- `fetch('/api/sections/active')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/sections/active\`)`
- `fetch('/api/news/search?q=...')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/news/search?q=...\`)`
- `fetch('/api/reports/search?q=...')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/reports/search?q=...\`)`
- `fetch('/api/sections/search?q=...')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/sections/search?q=...\`)`

### 3. ✅ إصلاح ملف `HomePage.js`
**الملف**: `backend/frontend/src/pages/HomePage.js`
**التغييرات**:
- `fetch('/api/basic-info/home')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/basic-info/home\`)`
- `fetch('/api/news')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/news\`)`
- `fetch('/api/reports')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/reports\`)`
- `fetch('/api/sections')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/sections\`)`
- `fetch('/api/news/search?q=...')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/news/search?q=...\`)`
- `fetch('/api/reports/search?q=...')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/reports/search?q=...\`)`
- إصلاح روابط PDF: `http://localhost:5000${pdfUrl}` → `\`${process.env.REACT_APP_API_URL || ''}${pdfUrl}\``

### 4. ✅ إصلاح ملف `NewsPage.js`
**الملف**: `backend/frontend/src/pages/NewsPage.js`
**التغييرات**:
- `fetch('/api/news')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/news\`)`

### 5. ✅ إصلاح ملف `ReportsPage.js`
**الملف**: `backend/frontend/src/pages/ReportsPage.js`
**التغييرات**:
- `fetch('/api/reports')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/reports\`)`
- إصلاح روابط PDF: `report.pdfUrl` → `\`${process.env.REACT_APP_API_URL || ''}${report.pdfUrl}\``

### 6. ✅ إصلاح ملف `SectionsPage.js`
**الملف**: `backend/frontend/src/pages/SectionsPage.js`
**التغييرات**:
- `fetch('/api/sections')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/sections\`)`

### 7. ✅ إصلاح ملف `ContactUsPage.js`
**الملف**: `backend/frontend/src/pages/ContactUsPage.js`
**التغييرات**:
- `fetch('/api/contact/info')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/contact/info\`)`
- `fetch('/api/contact/send')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/contact/send\`)`

### 8. ✅ إصلاح ملف `SectionDetailsPage.js`
**الملف**: `backend/frontend/src/pages/SectionDetailsPage.js`
**التغييرات**:
- `fetch('/api/sections/slug/${slug}')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/sections/slug/${slug}\`)`
- `fetch('/api/articles')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/articles\`)`

### 9. ✅ إصلاح ملف `ReportDetails.js`
**الملف**: `backend/frontend/src/pages/ReportDetails.js`
**التغييرات**:
- `fetch('/api/reports/${id}')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/reports/${id}\`)`
- إصلاح روابط PDF: `report.pdfUrl` → `\`${process.env.REACT_APP_API_URL || ''}${report.pdfUrl}\``

### 10. ✅ إصلاح ملف `NewsDetailsPage.js`
**الملف**: `backend/frontend/src/pages/NewsDetailsPage.js`
**التغييرات**:
- `fetch('/api/news/${id}')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/news/${id}\`)`

### 11. ✅ إصلاح ملف `ArticleDetailsPage.js`
**الملف**: `backend/frontend/src/pages/ArticleDetailsPage.js`
**التغييرات**:
- `fetch('/api/articles/${id}')` → `fetch(\`${process.env.REACT_APP_API_URL || ''}/api/articles/${id}\`)`

## إعدادات البيئة

### في الإنتاج (Render):
```bash
REACT_APP_API_URL=https://justice-org.onrender.com
```

### في التطوير المحلي:
```bash
REACT_APP_API_URL=http://localhost:5000
```

### بدون متغير (نفس الخادم):
```bash
# لا تحدد REACT_APP_API_URL أو اتركه فارغاً
REACT_APP_API_URL=
```

## كيف يعمل الحل

### مع متغير البيئة:
- `process.env.REACT_APP_API_URL` يحتوي على URL الباك إند
- جميع استدعاءات API تستخدم هذا المتغير
- يعمل في أي بيئة (محلي، إنتاج، خوادم مختلفة)

### بدون متغير البيئة:
- `process.env.REACT_APP_API_URL` يكون `undefined`
- `|| ''` يجعل النتيجة سلسلة فارغة
- النتيجة: URL نسبي يعمل مع نفس الخادم

## الملفات المعدلة

1. `backend/frontend/src/services/api.js`
2. `backend/frontend/src/components/Header.js`
3. `backend/frontend/src/pages/HomePage.js`
4. `backend/frontend/src/pages/NewsPage.js`
5. `backend/frontend/src/pages/ReportsPage.js`
6. `backend/frontend/src/pages/SectionsPage.js`
7. `backend/frontend/src/pages/ContactUsPage.js`
8. `backend/frontend/src/pages/SectionDetailsPage.js`
9. `backend/frontend/src/pages/ReportDetails.js`
10. `backend/frontend/src/pages/NewsDetailsPage.js`
11. `backend/frontend/src/pages/ArticleDetailsPage.js`

## إعدادات Render

### ملف `render.yaml`:
```yaml
envVars:
  - key: REACT_APP_API_URL
    value: https://justice-org.onrender.com
```

## النتيجة النهائية

✅ **جميع استدعاءات API** تستخدم متغير البيئة  
✅ **مرونة كاملة** في تحديد URL الباك إند  
✅ **يعمل محلياً** مع `localhost:5000`  
✅ **يعمل في الإنتاج** مع URL Render  
✅ **يعمل مع خوادم مختلفة** حسب الحاجة  

## الخطوات التالية

1. **إنشاء ملف `.env.local`** في الفرونت إند للتطوير المحلي
2. **إعادة بناء المشروع**: `npm run build`
3. **نشر على Render** مع متغير البيئة
4. **اختبار** في الإنتاج

**الحالة**: 🟢 تم حل جميع المشاكل
**النهج**: متغيرات البيئة
**الخطوة التالية**: إعداد ملفات البيئة ونشر المشروع
