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

    const response = await fetch('http://localhost:5000/api/articles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(articleData)
    });

    const result = await response.json();

    if (response.ok) {
      console.log('✅ تم إنشاء المقال بنجاح!');
      console.log('الرد:', result);
    } else {
      console.log('❌ فشل في إنشاء المقال');
      console.log('الخطأ:', result);
    }
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
}

// انتظار قليل لبدء الخادم
setTimeout(() => {
  testAddArticle();
}, 3000); 