// اختبار نظام رفع الملفات والمسارات الجديدة
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

// بيانات اختبار
const testData = {
  username: 'admin',
  password: 'admin123'
};

// دالة تسجيل الدخول
async function login() {
  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error('❌ خطأ في تسجيل الدخول:', error.message);
    return null;
  }
}

// اختبار رفع ملف
async function testFileUpload(token) {
  try {
    console.log('📤 اختبار رفع ملف...');
    
    // إنشاء ملف اختبار بسيط
    const testContent = 'This is a test file for upload system';
    const testFilePath = './test_upload.txt';
    fs.writeFileSync(testFilePath, testContent);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));

    const response = await fetch(`${BASE_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders()
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ تم رفع الملف بنجاح:', data);
    
    // حذف الملف المؤقت
    fs.unlinkSync(testFilePath);
    
    return data.url;
  } catch (error) {
    console.error('❌ خطأ في رفع الملف:', error.message);
    return null;
  }
}

// اختبار إنشاء تقرير
async function testCreateReport(token, imageUrl) {
  try {
    console.log('📝 اختبار إنشاء تقرير...');
    
    const reportData = {
      title: 'تقرير اختبار النظام',
      summary: 'هذا تقرير اختبار للنظام الجديد',
      content: '<p>محتوى التقرير مع <strong>تنسيق</strong> HTML</p>',
      thumbnail: imageUrl,
      pdfUrl: imageUrl, // استخدام نفس الرابط للاختبار
      publishDate: new Date().toISOString(),
      status: 'draft'
    };

    const response = await fetch(`${BASE_URL}/api/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });

    if (!response.ok) {
      throw new Error(`Create report failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ تم إنشاء التقرير بنجاح:', data);
    return data.report.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء التقرير:', error.message);
    return null;
  }
}

// اختبار إنشاء مقال
async function testCreateArticle(token, imageUrl) {
  try {
    console.log('📰 اختبار إنشاء مقال...');
    
    const articleData = {
      title: 'مقال اختبار النظام',
      content: '<p>محتوى المقال مع <em>تنسيق</em> HTML</p>',
      summary: 'ملخص المقال للاختبار',
      image: imageUrl,
      publishDate: new Date().toISOString(),
      status: 'draft'
    };

    const response = await fetch(`${BASE_URL}/api/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });

    if (!response.ok) {
      throw new Error(`Create article failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ تم إنشاء المقال بنجاح:', data);
    return data.article.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء المقال:', error.message);
    return null;
  }
}

// اختبار إنشاء خبر
async function testCreateNews(token, imageUrl) {
  try {
    console.log('📢 اختبار إنشاء خبر...');
    
    const newsData = {
      title: 'خبر اختبار النظام',
      summary: 'ملخص الخبر للاختبار',
      content: '<p>محتوى الخبر مع <u>تنسيق</u> HTML</p>',
      image: imageUrl,
      publishDate: new Date().toISOString(),
      status: 'draft'
    };

    const response = await fetch(`${BASE_URL}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newsData)
    });

    if (!response.ok) {
      throw new Error(`Create news failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ تم إنشاء الخبر بنجاح:', data);
    return data.news.id;
  } catch (error) {
    console.error('❌ خطأ في إنشاء الخبر:', error.message);
    return null;
  }
}

// اختبار تعديل تقرير
async function testUpdateReport(token, reportId) {
  try {
    console.log('✏️ اختبار تعديل تقرير...');
    
    const updateData = {
      title: 'تقرير اختبار النظام - محدث',
      summary: 'ملخص محدث للتقرير',
      content: '<p>محتوى محدث للتقرير</p>',
      status: 'published'
    };

    const response = await fetch(`${BASE_URL}/api/reports/${reportId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`Update report failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ تم تعديل التقرير بنجاح:', data);
  } catch (error) {
    console.error('❌ خطأ في تعديل التقرير:', error.message);
  }
}

// اختبار تعديل مقال
async function testUpdateArticle(token, articleId) {
  try {
    console.log('✏️ اختبار تعديل مقال...');
    
    const updateData = {
      title: 'مقال اختبار النظام - محدث',
      content: '<p>محتوى محدث للمقال</p>',
      summary: 'ملخص محدث للمقال',
      status: 'published'
    };

    const response = await fetch(`${BASE_URL}/api/articles/${articleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`Update article failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ تم تعديل المقال بنجاح:', data);
  } catch (error) {
    console.error('❌ خطأ في تعديل المقال:', error.message);
  }
}

// اختبار تعديل خبر
async function testUpdateNews(token, newsId) {
  try {
    console.log('✏️ اختبار تعديل خبر...');
    
    const updateData = {
      title: 'خبر اختبار النظام - محدث',
      summary: 'ملخص محدث للخبر',
      content: '<p>محتوى محدث للخبر</p>',
      status: 'published'
    };

    const response = await fetch(`${BASE_URL}/api/news/${newsId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      throw new Error(`Update news failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ تم تعديل الخبر بنجاح:', data);
  } catch (error) {
    console.error('❌ خطأ في تعديل الخبر:', error.message);
  }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
  console.log('🚀 بدء اختبار نظام رفع الملفات والمسارات الجديدة...\n');

  // تسجيل الدخول
  const token = await login();
  if (!token) {
    console.error('❌ فشل في الحصول على token. إيقاف الاختبارات.');
    return;
  }
  console.log('✅ تم تسجيل الدخول بنجاح\n');

  // اختبار رفع ملف
  const imageUrl = await testFileUpload(token);
  if (!imageUrl) {
    console.error('❌ فشل في رفع الملف. إيقاف الاختبارات.');
    return;
  }
  console.log('');

  // اختبار إنشاء المحتوى
  const reportId = await testCreateReport(token, imageUrl);
  const articleId = await testCreateArticle(token, imageUrl);
  const newsId = await testCreateNews(token, imageUrl);
  console.log('');

  // اختبار تعديل المحتوى
  if (reportId) await testUpdateReport(token, reportId);
  if (articleId) await testUpdateArticle(token, articleId);
  if (newsId) await testUpdateNews(token, newsId);
  console.log('');

  console.log('🎉 تم الانتهاء من جميع الاختبارات!');
  console.log('📋 ملخص النتائج:');
  console.log(`   - رفع ملف: ${imageUrl ? '✅' : '❌'}`);
  console.log(`   - إنشاء تقرير: ${reportId ? '✅' : '❌'}`);
  console.log(`   - إنشاء مقال: ${articleId ? '✅' : '❌'}`);
  console.log(`   - إنشاء خبر: ${newsId ? '✅' : '❌'}`);
}

// تشغيل الاختبارات
runAllTests().catch(console.error);
