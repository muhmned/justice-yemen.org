const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('جاري اختبار تسجيل الدخول...');
    
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'system_admin',
        password: '123456789',
        remember: false
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ تم تسجيل الدخول بنجاح!');
      console.log('Token:', data.token ? 'موجود' : 'غير موجود');
      console.log('User:', data.user ? 'موجود' : 'غير موجود');
    } else {
      console.log('❌ فشل في تسجيل الدخول');
      console.log('Error:', data.error);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
}

testLogin(); 