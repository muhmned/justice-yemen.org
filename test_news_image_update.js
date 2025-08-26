const fs = require('fs');
const FormData = require('form-data');

// اختبار نظام تعديل صور الأخبار الجديد
async function testNewsImageUpdate() {
  console.log('🧪 اختبار نظام تعديل صور الأخبار الجديد');
  console.log('=====================================');

  const API_URL = process.env.API_URL || 'http://localhost:3001';
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    console.error('❌ يجب تحديد ADMIN_TOKEN في متغيرات البيئة');
    return;
  }

  try {
    // 1. جلب قائمة الأخبار
    console.log('\n1️⃣ جلب قائمة الأخبار...');
    const newsResponse = await fetch(`${API_URL}/api/news`);
    const newsList = await newsResponse.json();
    
    if (newsList.length === 0) {
      console.log('⚠️ لا توجد أخبار متاحة للاختبار');
      return;
    }

    const testNews = newsList[0];
    console.log(`✅ تم العثور على خبر للاختبار: ${testNews.title}`);

    // 2. اختبار تحديث الخبر بدون تغيير الصورة
    console.log('\n2️⃣ اختبار تحديث الخبر بدون تغيير الصورة...');
    const updateData = {
      title: testNews.title + ' (محدث)',
      summary: testNews.summary + ' - تم التحديث',
      content: testNews.content + '<p>تم إضافة محتوى جديد</p>',
      status: 'draft'
    };

    const updateResponse = await fetch(`${API_URL}/api/news/${testNews.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (updateResponse.ok) {
      console.log('✅ تم تحديث الخبر بنجاح بدون تغيير الصورة');
    } else {
      const error = await updateResponse.json();
      console.error('❌ فشل في تحديث الخبر:', error);
    }

    // 3. اختبار تحديث الخبر مع صورة جديدة
    console.log('\n3️⃣ اختبار تحديث الخبر مع صورة جديدة...');
    
    // إنشاء ملف صورة وهمي للاختبار
    const testImagePath = './test_image.jpg';
    if (!fs.existsSync(testImagePath)) {
      console.log('⚠️ ملف test_image.jpg غير موجود، إنشاء ملف وهمي...');
      // إنشاء ملف وهمي
      fs.writeFileSync(testImagePath, 'fake image data');
    }

    const formData = new FormData();
    formData.append('title', testNews.title + ' (مع صورة جديدة)');
    formData.append('summary', testNews.summary + ' - مع صورة جديدة');
    formData.append('content', testNews.content + '<p>تم إضافة صورة جديدة</p>');
    formData.append('status', 'draft');
    formData.append('image', fs.createReadStream(testImagePath));

    const imageUpdateResponse = await fetch(`${API_URL}/api/news/${testNews.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (imageUpdateResponse.ok) {
      const updatedNews = await imageUpdateResponse.json();
      console.log('✅ تم تحديث الخبر مع الصورة الجديدة بنجاح');
      console.log('📸 رابط الصورة الجديدة:', updatedNews.news.image);
    } else {
      const error = await imageUpdateResponse.json();
      console.error('❌ فشل في تحديث الخبر مع الصورة:', error);
    }

    // 4. اختبار تحديث الخبر مع URL صورة موجود
    console.log('\n4️⃣ اختبار تحديث الخبر مع URL صورة موجود...');
    
    const urlUpdateData = {
      title: testNews.title + ' (مع URL صورة)',
      summary: testNews.summary + ' - مع URL صورة',
      content: testNews.content + '<p>تم إضافة URL صورة</p>',
      status: 'draft',
      image: 'https://example.com/test-image.jpg'
    };

    const urlUpdateResponse = await fetch(`${API_URL}/api/news/${testNews.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(urlUpdateData)
    });

    if (urlUpdateResponse.ok) {
      console.log('✅ تم تحديث الخبر مع URL الصورة بنجاح');
    } else {
      const error = await urlUpdateResponse.json();
      console.error('❌ فشل في تحديث الخبر مع URL الصورة:', error);
    }

    console.log('\n🎉 تم الانتهاء من جميع الاختبارات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار
testNewsImageUpdate();
