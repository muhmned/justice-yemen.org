// اختبار حفظ التوكين
const testTokenSave = async () => {
  console.log('=== اختبار حفظ التوكين ===');
  
  try {
    // محاولة تسجيل الدخول
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('استجابة تسجيل الدخول:', loginData);

    if (loginResponse.ok && loginData.token) {
      console.log('✅ تم الحصول على التوكين بنجاح');
      console.log('التوكين:', loginData.token.substring(0, 20) + '...');
      
      // اختبار نقطة النهاية /me
      const meResponse = await fetch('http://localhost:5000/api/users/me', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });

      const meData = await meResponse.json();
      console.log('استجابة /me:', meData);

      if (meResponse.ok) {
        console.log('✅ تم التحقق من التوكين بنجاح');
        console.log('بيانات المستخدم:', meData);
      } else {
        console.log('❌ فشل في التحقق من التوكين');
      }
    } else {
      console.log('❌ فشل في تسجيل الدخول');
      console.log('الخطأ:', loginData.error);
    }
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
};

// تشغيل الاختبار
testTokenSave(); 