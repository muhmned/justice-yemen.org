const fetch = require('node-fetch');

async function testMeEndpoint() {
  try {
    console.log('جاري اختبار نقطة /api/users/me...');
    
    // أولاً نحصل على token من تسجيل الدخول
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
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

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ فشل في تسجيل الدخول:', loginData.error);
      return;
    }

    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('Token:', loginData.token ? 'موجود' : 'غير موجود');

    // الآن نختبر نقطة /api/users/me
    const meResponse = await fetch('http://localhost:5000/api/users/me', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const meData = await meResponse.json();
    
    console.log('\n--- اختبار نقطة /api/users/me ---');
    console.log('Status:', meResponse.status);
    console.log('Response:', JSON.stringify(meData, null, 2));
    
    if (meResponse.ok) {
      console.log('✅ تم جلب بيانات المستخدم بنجاح!');
      console.log('User ID:', meData.id);
      console.log('Username:', meData.username);
      console.log('Role:', meData.role);
    } else {
      console.log('❌ فشل في جلب بيانات المستخدم');
      console.log('Error:', meData.error);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
}

testMeEndpoint(); 