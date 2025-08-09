async function testAddArticleWithAuth() {
  try {
    console.log('بدء اختبار إضافة مقال مع المصادقة...');
    
    // أولاً: تسجيل الدخول
    console.log('1. تسجيل الدخول...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'editor',
        password: 'editor123456'
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ فشل في تسجيل الدخول:', loginData.error);
      return;
    }

    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('المستخدم:', loginData.user?.username);
    console.log('الدور:', loginData.user?.role);
    
    const token = loginData.token;
    
    // ثانياً: إضافة مقال
    console.log('2. إضافة مقال...');
    const articleData = {
      title: "مقال تجريبي للاختبار",
      content: "<p>هذا محتوى تجريبي لاختبار إضافة المقال الجديد</p>",
      sectionId: "4b4d6a7b-c1f0-4fa3-ba7a-6430cf946a26",
      userId: loginData.user.id
    };

    console.log('بيانات المقال:', articleData);

    const articleResponse = await fetch('http://localhost:5000/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });

    const articleResult = await articleResponse.json();

    if (articleResponse.ok) {
      console.log('✅ تم إنشاء المقال بنجاح!');
      console.log('الرد:', articleResult);
    } else {
      console.log('❌ فشل في إنشاء المقال');
      console.log('الخطأ:', articleResult);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
}

// انتظار قليل لبدء الخادم
setTimeout(() => {
  testAddArticleWithAuth();
}, 3000); 