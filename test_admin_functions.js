const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAdminFunctions() {
  try {
    console.log('🔍 اختبار وظائف لوحة التحكم...\n');

    // 1. اختبار تسجيل الدخول
    console.log('1️⃣ اختبار تسجيل الدخول:');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'system_admin',
        password: '123456789',
        remember: false
      })
    });

    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.log('❌ فشل في تسجيل الدخول:', loginData.error);
      return;
    }

    console.log('✅ تم تسجيل الدخول بنجاح');
    const token = loginData.token;
    console.log('Token:', token ? 'موجود' : 'غير موجود');

    // 2. اختبار جلب الأقسام النشطة
    console.log('\n2️⃣ اختبار جلب الأقسام النشطة:');
    const sectionsResponse = await fetch('http://localhost:5000/api/sections/active');
    const sections = await sectionsResponse.json();
    
    console.log(`✅ تم جلب ${sections.length} قسم نشط`);
    sections.forEach(section => {
      console.log(`  - ${section.name} (ID: ${section.id})`);
    });

    // 3. اختبار رفع ملف
    console.log('\n3️⃣ اختبار رفع ملف:');
    
    // إنشاء ملف تجريبي
    const testFilePath = path.join(__dirname, 'test-image.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    
    const uploadResponse = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const uploadData = await uploadResponse.json();
    
    if (uploadResponse.ok) {
      console.log('✅ تم رفع الملف بنجاح');
      console.log('URL:', uploadData.url);
    } else {
      console.log('❌ فشل في رفع الملف:', uploadData.error);
    }

    // حذف الملف التجريبي
    fs.unlinkSync(testFilePath);

    // 4. اختبار إضافة مقال
    console.log('\n4️⃣ اختبار إضافة مقال:');
    
    const articleFormData = new FormData();
    articleFormData.append('title', 'مقال تجريبي للاختبار');
    articleFormData.append('content', '<p>هذا محتوى تجريبي للمقال</p>');
    articleFormData.append('sectionId', sections[0]?.id || '');
    
    const addArticleResponse = await fetch('http://localhost:5000/api/articles', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: articleFormData
    });

    const addArticleData = await addArticleResponse.json();
    
    if (addArticleResponse.ok) {
      console.log('✅ تم إضافة المقال بنجاح');
      console.log('ID المقال:', addArticleData.id);
      
      // 5. اختبار تعديل المقال
      console.log('\n5️⃣ اختبار تعديل المقال:');
      
      const editFormData = new FormData();
      editFormData.append('title', 'مقال تجريبي معدل');
      editFormData.append('content', '<p>هذا محتوى معدل للمقال</p>');
      editFormData.append('sectionId', sections[0]?.id || '');
      
      const editArticleResponse = await fetch(`http://localhost:5000/api/articles/${addArticleData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: editFormData
      });

      const editArticleData = await editArticleResponse.json();
      
      if (editArticleResponse.ok) {
        console.log('✅ تم تعديل المقال بنجاح');
      } else {
        console.log('❌ فشل في تعديل المقال:', editArticleData.error);
      }
      
      // 6. اختبار حذف المقال
      console.log('\n6️⃣ اختبار حذف المقال:');
      
      const deleteArticleResponse = await fetch(`http://localhost:5000/api/articles/${addArticleData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (deleteArticleResponse.ok) {
        console.log('✅ تم حذف المقال بنجاح');
      } else {
        const deleteData = await deleteArticleResponse.json();
        console.log('❌ فشل في حذف المقال:', deleteData.error);
      }
      
    } else {
      console.log('❌ فشل في إضافة المقال:', addArticleData.error);
    }

    // 7. اختبار إضافة تقرير
    console.log('\n7️⃣ اختبار إضافة تقرير:');
    
    const reportData = {
      title: 'تقرير تجريبي',
      summary: 'ملخص التقرير التجريبي',
      content: '<p>محتوى التقرير التجريبي</p>',
      publishDate: new Date().toISOString(),
      thumbnail: '/uploads/test-thumbnail.jpg',
      pdfUrl: '/uploads/test-report.pdf'
    };
    
    const addReportResponse = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });

    const addReportData = await addReportResponse.json();
    
    if (addReportResponse.ok) {
      console.log('✅ تم إضافة التقرير بنجاح');
      console.log('ID التقرير:', addReportData.id);
      
      // اختبار تعديل التقرير
      console.log('\n8️⃣ اختبار تعديل التقرير:');
      
      const editReportData = {
        title: 'تقرير تجريبي معدل',
        summary: 'ملخص معدل للتقرير',
        content: '<p>محتوى معدل للتقرير</p>',
        publishDate: new Date().toISOString()
      };
      
      const editReportResponse = await fetch(`http://localhost:5000/api/reports/${addReportData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editReportData)
      });

      const editReportResult = await editReportResponse.json();
      
      if (editReportResponse.ok) {
        console.log('✅ تم تعديل التقرير بنجاح');
      } else {
        console.log('❌ فشل في تعديل التقرير:', editReportResult.error);
      }
      
      // اختبار حذف التقرير
      console.log('\n9️⃣ اختبار حذف التقرير:');
      
      const deleteReportResponse = await fetch(`http://localhost:5000/api/reports/${addReportData.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (deleteReportResponse.ok) {
        console.log('✅ تم حذف التقرير بنجاح');
      } else {
        const deleteReportData = await deleteReportResponse.json();
        console.log('❌ فشل في حذف التقرير:', deleteReportData.error);
      }
      
    } else {
      console.log('❌ فشل في إضافة التقرير:', addReportData.error);
    }

    console.log('\n✅ انتهى اختبار وظائف لوحة التحكم بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testAdminFunctions(); 