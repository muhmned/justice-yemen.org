const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api/auth/login';
const USERNAME = 'admin';
const PASSWORD = 'admin'; // تم التعديل هنا

async function getAdminToken() {
  try {
    const res = await fetch(API_URL, {
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