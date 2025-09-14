const axios = require('axios');

async function testAddArticle() {
  try {
    console.log('بدء اختبار إضافة مقال...');
    
    const articleData = {
      title: "مقال تجريبي للاختبار",
      content: "<p>هذا محتوى تجريبي لاختبار إضافة المقال الجديد</p>",
      sectionId: "4b4d6a7b-c1f0-4fa3-ba7a-6430cf946a26",
      userId: "13116e53-2138-46a1-9b94-f42e7d9ec4d5"
    };

    console.log('بيانات المقال:', articleData);

    const response = await axios.post('http://localhost:5000/api/articles', articleData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ تم إنشاء المقال بنجاح!');
    console.log('الرد:', response.data);
  } catch (error) {
    console.error('❌ خطأ في إنشاء المقال:');
    if (error.response) {
      console.error('الخطأ:', error.response.data);
      console.error('الحالة:', error.response.status);
    } else {
      console.error('الخطأ:', error.message);
    }
  }
}

// انتظار قليل لبدء الخادم
setTimeout(() => {
  testAddArticle();
}, 3000); 