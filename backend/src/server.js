// ================== تحميل المكتبات ==================
const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// ================== تهيئة التطبيق ==================
const app = express();
app.use(cors());
app.use(express.json());

// ================== المسارات API ==================
// مثال: الرسائل
app.use('/api/messages', require('./routes/messages'));

// مثال: المستخدمين
app.use('/api/users', require('./routes/users'));

// أي مسار آخر يمكن إضافته هنا
// app.use('/api/auth', require('./routes/auth'));

// ================== وضع الإنتاج ==================
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../../frontend/build');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ================== تشغيل الخادم ==================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
