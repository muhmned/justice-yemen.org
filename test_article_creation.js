const axios = require('axios');

async function testCreateArticle() {
  try {
    const articleData = {
      title: "مقال تجريبي للاختبار",
      content: "<p>هذا محتوى تجريبي لاختبار إضافة المقال</p>",
      sectionId: "4b4d6a7b-c1f0-4fa3-ba7a-6430cf946a26", // استبدل بمعرف قسم صحيح
      userId: "13116e53-2138-46a1-9b94-f42e7d9ec4d5" // استبدل بمعرف مستخدم صحيح
    };

    const response = await axios.post('http://localhost:5000/api/articles', articleData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // استبدل بالتوكن الصحيح
      }
    });

    console.log('تم إنشاء المقال بنجاح:', response.data);
  } catch (error) {
    console.error('خطأ في إنشاء المقال:', error.response?.data || error.message);
  }
}

testCreateArticle(); 