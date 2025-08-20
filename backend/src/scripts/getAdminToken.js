const fetch = require('node-fetch');

// نقرأ الـ root URL من env
// إذا ما وجد يرجع localhost
const API_BASE_URL = process.env.API_URL || process.env.REACT_APP_API_URL || 'http://localhost:5000';

// بيانات تسجيل الدخول
const USERNAME = process.env.ADMIN_USERNAME || 'admin';
const PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

async function getAdminToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: USERNAME, password: PASSWORD })
    });

    const data = await res.json();

    if (res.ok && data.token) {
      console.log('✅ Admin Token:');
      console.log(data.token);
    } else {
      console.error('❌ فشل تسجيل الدخول:', data);
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

getAdminToken();
