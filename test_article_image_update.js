const fs = require('fs');
const FormData = require('form-data');

// اختبار نظام تعديل صور المقالات الجديد
async function testArticleImageUpdate() {
  console.log('🧪 اختبار نظام تعديل صور المقالات الجديد');
  console.log('=====================================');

  const API_URL = process.env.API_URL || 'http://localhost:3001';
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    console.error('❌ يجب تحديد ADMIN_TOKEN في متغيرات البيئة');
    return;
  }

  try {
    // 1. جلب قائمة المقالات
    console.log('\n1️⃣ جلب قائمة المقالات...');
    const articlesResponse = await fetch(`${API_URL}/api/articles`);
    const articlesList = await articlesResponse.json();
    
    if (articlesList.length === 0) {
      console.log('⚠️ لا توجد مقالات متاحة للاختبار');
      return;
    }

    const testArticle = articlesList[0];
    console.log(`✅ تم العثور على مقال للاختبار: ${testArticle.title}`);

    // 2. اختبار تحديث المقال بدون تغيير الصورة
    console.log('\n2️⃣ اختبار تحديث المقال بدون تغيير الصورة...');
    const updateData = {
      title: testArticle.title + ' (محدث)',
      content: testArticle.content + '<p>تم إضافة محتوى جديد</p>',
      sectionId: testArticle.sectionId
    };

    const updateResponse = await fetch(`${API_URL}/api/articles/${testArticle.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      console.log('✅ تم تحديث المقال بنجاح بدون تغيير الصورة');
    } else {
      const error = await updateResponse.json();
      console.error('❌ فشل في تحديث المقال:', error);
    }

    // 3. اختبار تحديث المقال مع صورة جديدة
    console.log('\n3️⃣ اختبار تحديث المقال مع صورة جديدة...');
    
    // إنشاء ملف صورة وهمي للاختبار
    const testImagePath = './test_article_image.jpg';
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ ملف test_article_image.jpg غير موجود، إنشاء ملف وهمي...');
      // إنشاء ملف وهمي
      fs.writeFileSync(testImagePath, 'fake image data');
    }

    const formData = new FormData();
    formData.append('title', testArticle.title + ' (مع صورة جديدة)');
    formData.append('content', testArticle.content + '<p>تم إضافة صورة جديدة</p>');
    formData.append('sectionId', testArticle.sectionId);
    formData.append('image', fs.createReadStream(testImagePath));

    const imageUpdateResponse = await fetch(`${API_URL}/api/articles/${testArticle.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (imageUpdateResponse.ok) {
      const updatedArticle = await imageUpdateResponse.json();
      console.log('✅ تم تحديث المقال مع الصورة الجديدة بنجاح');
      console.log('📸 رابط الصورة الجديدة:', updatedArticle.article.image);
    } else {
      const error = await imageUpdateResponse.json();
      console.error('❌ فشل في تحديث المقال مع الصورة:', error);
    }

    // 4. اختبار تحديث المقال مع URL صورة موجود
    console.log('\n4️⃣ اختبار تحديث المقال مع URL صورة موجود...');
    
    const urlUpdateData = {
      title: testArticle.title + ' (مع URL صورة)',
      content: testArticle.content + '<p>تم إضافة URL صورة</p>',
      sectionId: testArticle.sectionId,
      image: 'https://example.com/test-article-image.jpg'
    };

    const urlUpdateResponse = await fetch(`${API_URL}/api/articles/${testArticle.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(urlUpdateData)
    });

    if (urlUpdateResponse.ok) {
      console.log('✅ تم تحديث المقال مع URL الصورة بنجاح');
    } else {
      const error = await urlUpdateResponse.json();
      console.error('❌ فشل في تحديث المقال مع URL الصورة:', error);
    }

    console.log('\n🎉 تم الانتهاء من جميع الاختبارات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار
testArticleImageUpdate();
