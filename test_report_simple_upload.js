const fs = require('fs');
const path = require('path');

async function testSimpleUpload() {
  try {
    console.log('بدء اختبار رفع ملف PDF بسيط...');
    
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
    const token = loginData.token;
    
    // ثانياً: إنشاء ملف PDF تجريبي
    console.log('2. إنشاء ملف PDF تجريبي...');
    const pdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n72 720 Td\n(Test PDF) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000204 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n297\n%%EOF';
    
    const pdfPath = path.join(__dirname, 'test_simple.pdf');
    fs.writeFileSync(pdfPath, pdfContent);
    
    // ثالثاً: رفع ملف PDF فقط
    console.log('3. رفع ملف PDF...');
    
    // إنشاء FormData
    const FormData = require('form-data');
    const form = new FormData();
    
    form.append('title', 'تقرير تجريبي بسيط');
    form.append('summary', 'ملخص تجريبي');
    form.append('content', '<p>محتوى تجريبي</p>');
    form.append('status', 'draft');
    
    // إضافة ملف PDF فقط
    form.append('pdfFile', fs.createReadStream(pdfPath), {
      filename: 'test_simple.pdf',
      contentType: 'application/pdf'
    });
    
    console.log('إرسال الطلب...');
    const reportResponse = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...form.getHeaders()
      },
      body: form
    });

    console.log('استلام الرد...');
    const reportResult = await reportResponse.json();

    if (reportResponse.ok) {
      console.log('✅ تم إنشاء التقرير بنجاح!');
      console.log('الرد:', reportResult);
    } else {
      console.log('❌ فشل في إنشاء التقرير');
      console.log('الخطأ:', reportResult);
    }
    
    // تنظيف الملفات المؤقتة
    fs.unlinkSync(pdfPath);
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
  }
}

// انتظار قليل لبدء الخادم
setTimeout(() => {
  testSimpleUpload();
}, 3000); 