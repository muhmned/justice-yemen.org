const fetch = require('node-fetch');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testReportUpload() {
  console.log('🧪 اختبار نظام رفع التقارير...\n');

  try {
    // 1. تسجيل الدخول
    console.log('1️⃣ تسجيل الدخول...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`فشل تسجيل الدخول: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ تم تسجيل الدخول بنجاح\n');

    // 2. رفع صورة
    console.log('2️⃣ رفع صورة...');
    const imageFormData = new FormData();
    // إنشاء ملف صورة وهمي للاختبار
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (!fs.existsSync(testImagePath)) {
      // إنشاء ملف صورة وهمي
      const buffer = Buffer.from('fake image data');
      fs.writeFileSync(testImagePath, buffer);
    }
    imageFormData.append('file', fs.createReadStream(testImagePath));

    const imageResponse = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...imageFormData.getHeaders()
      },
      body: imageFormData
    });

    if (!imageResponse.ok) {
      throw new Error(`فشل رفع الصورة: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const imageUrl = imageData.url;
    console.log('✅ تم رفع الصورة بنجاح:', imageUrl, '\n');

    // 3. رفع ملف PDF
    console.log('3️⃣ رفع ملف PDF...');
    const pdfFormData = new FormData();
    // إنشاء ملف PDF وهمي للاختبار
    const testPdfPath = path.join(__dirname, 'test-document.pdf');
    if (!fs.existsSync(testPdfPath)) {
      // إنشاء ملف PDF وهمي
      const buffer = Buffer.from('%PDF-1.4 fake pdf data');
      fs.writeFileSync(testPdfPath, buffer);
    }
    pdfFormData.append('file', fs.createReadStream(testPdfPath));

    const pdfResponse = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...pdfFormData.getHeaders()
      },
      body: pdfFormData
    });

    if (!pdfResponse.ok) {
      throw new Error(`فشل رفع PDF: ${pdfResponse.status}`);
    }

    const pdfData = await pdfResponse.json();
    const pdfUrl = pdfData.url;
    console.log('✅ تم رفع PDF بنجاح:', pdfUrl, '\n');

    // 4. إنشاء تقرير
    console.log('4️⃣ إنشاء تقرير...');
    const reportData = {
      title: 'تقرير اختبار - ' + new Date().toISOString(),
      summary: 'ملخص تقرير الاختبار',
      content: '<p>محتوى تقرير الاختبار</p>',
      pdfUrl: pdfUrl,
      thumbnail: imageUrl,
      publishDate: new Date().toISOString(),
      status: 'draft'
    };

    const reportResponse = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reportData)
    });

    if (!reportResponse.ok) {
      const errorText = await reportResponse.text();
      throw new Error(`فشل إنشاء التقرير: ${reportResponse.status} - ${errorText}`);
    }

    const reportResult = await reportResponse.json();
    console.log('✅ تم إنشاء التقرير بنجاح:', reportResult.report.id, '\n');

    // 5. التحقق من التقرير
    console.log('5️⃣ التحقق من التقرير...');
    const getReportResponse = await fetch(`http://localhost:5000/api/reports/${reportResult.report.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!getReportResponse.ok) {
      throw new Error(`فشل جلب التقرير: ${getReportResponse.status}`);
    }

    const savedReport = await getReportResponse.json();
    console.log('✅ تم جلب التقرير بنجاح');
    console.log('   - العنوان:', savedReport.title);
    console.log('   - الصورة:', savedReport.thumbnail);
    console.log('   - PDF:', savedReport.pdfUrl);
    console.log('   - المحتوى:', savedReport.content ? 'موجود' : 'غير موجود');

    // تنظيف الملفات المؤقتة
    if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
    if (fs.existsSync(testPdfPath)) fs.unlinkSync(testPdfPath);

    console.log('\n🎉 تم اختبار نظام رفع التقارير بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    process.exit(1);
  }
}

// تشغيل الاختبار
testReportUpload(); 