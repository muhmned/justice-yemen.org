const testContentManagement = async () => {
  console.log('=== اختبار إدارة المحتوى ===');
  
  // اختبار تسجيل الدخول
  const loginData = {
    username: 'admin',
    password: 'admin123'
  };
  
  try {
    console.log('1. اختبار تسجيل الدخول...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loginData)
    });
    
    if (!loginRes.ok) {
      throw new Error(`خطأ في تسجيل الدخول: ${loginRes.status}`);
    }
    
    const loginResult = await loginRes.json();
    const token = loginResult.token;
    console.log('✓ تم تسجيل الدخول بنجاح');
    
    // اختبار جلب الأخبار
    console.log('2. اختبار جلب الأخبار...');
    const newsRes = await fetch('http://localhost:5000/api/news', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (newsRes.ok) {
      const news = await newsRes.json();
      console.log(`✓ تم جلب ${news.length} خبر`);
    } else {
      console.log('✗ فشل في جلب الأخبار');
    }
    
    // اختبار جلب التقارير
    console.log('3. اختبار جلب التقارير...');
    const reportsRes = await fetch('http://localhost:5000/api/reports', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (reportsRes.ok) {
      const reports = await reportsRes.json();
      console.log(`✓ تم جلب ${reports.length} تقرير`);
    } else {
      console.log('✗ فشل في جلب التقارير');
    }
    
    // اختبار جلب المقالات
    console.log('4. اختبار جلب المقالات...');
    const articlesRes = await fetch('http://localhost:5000/api/articles', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (articlesRes.ok) {
      const articles = await articlesRes.json();
      console.log(`✓ تم جلب ${articles.length} مقال`);
    } else {
      console.log('✗ فشل في جلب المقالات');
    }
    
    console.log('=== انتهى الاختبار ===');
    
  } catch (error) {
    console.error('خطأ في الاختبار:', error);
  }
};

// تشغيل الاختبار
testContentManagement(); 