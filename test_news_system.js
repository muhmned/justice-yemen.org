const fetch = require('node-fetch');

async function testNewsAPI() {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 اختبار نظام الأخبار...\n');
  
  try {
    // 1. اختبار health check
    console.log('1. اختبار health check...');
    const healthRes = await fetch(`${baseURL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData);
    
    // 2. اختبار جلب الأخبار (عام)
    console.log('\n2. اختبار جلب الأخبار...');
    const newsRes = await fetch(`${baseURL}/news`);
    const newsData = await newsRes.json();
    console.log('✅ الأخبار:', Array.isArray(newsData) ? `${newsData.length} خبر` : 'خطأ في البيانات');
    
    // 3. اختبار تسجيل الدخول
    console.log('\n3. اختبار تسجيل الدخول...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: '123456789'
      })
    });
    
    if (loginRes.ok) {
      const loginData = await loginRes.json();
      console.log('✅ تسجيل الدخول ناجح');
      
      // 4. اختبار إضافة خبر (يتطلب مصادقة)
      console.log('\n4. اختبار إضافة خبر...');
      const formData = new FormData();
      formData.append('title', 'خبر تجريبي');
      formData.append('summary', 'ملخص الخبر التجريبي');
      formData.append('content', 'محتوى الخبر التجريبي');
      formData.append('status', 'draft');
      
      const addNewsRes = await fetch(`${baseURL}/news`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        },
        body: formData
      });
      
      if (addNewsRes.ok) {
        const addNewsData = await addNewsRes.json();
        console.log('✅ إضافة خبر ناجحة:', addNewsData.message);
        
        // 5. اختبار جلب الخبر المضاف
        console.log('\n5. اختبار جلب الخبر المضاف...');
        const getNewsRes = await fetch(`${baseURL}/news/${addNewsData.news.id}`);
        const getNewsData = await getNewsRes.json();
        console.log('✅ جلب الخبر:', getNewsData.title);
        
      } else {
        const errorData = await addNewsRes.json();
        console.log('❌ خطأ في إضافة خبر:', errorData);
      }
      
    } else {
      const errorData = await loginRes.json();
      console.log('❌ خطأ في تسجيل الدخول:', errorData);
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
  
  console.log('\n🏁 انتهى الاختبار');
}

// تشغيل الاختبار
testNewsAPI(); 