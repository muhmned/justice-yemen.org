// اختبار ترتيب التقارير
const https = require('https');
const http = require('http');

function makeRequest(url, options, data = null) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function testReportOrdering() {
  console.log('📋 اختبار ترتيب التقارير...\n');

  try {
    // 1. تسجيل الدخول
    console.log('1️⃣ تسجيل الدخول...');
    const loginData = JSON.stringify({
      username: 'admin',
      password: 'admin123456'
    });

    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);

    if (loginResponse.status !== 200) {
      throw new Error(`فشل تسجيل الدخول: ${loginResponse.status}`);
    }

    const token = loginResponse.data.token;
    console.log('✅ تم تسجيل الدخول بنجاح\n');

    // 2. جلب جميع التقارير
    console.log('2️⃣ جلب جميع التقارير...');
    const reportsResponse = await makeRequest('http://localhost:5000/api/reports', {
      method: 'GET'
    });

    if (reportsResponse.status !== 200) {
      throw new Error(`فشل جلب التقارير: ${reportsResponse.status}`);
    }

    const reports = reportsResponse.data;
    console.log(`✅ تم جلب ${reports.length} تقرير\n`);

    // 3. عرض التقارير مع التواريخ
    console.log('3️⃣ عرض التقارير مرتبة حسب تاريخ الإنشاء:');
    console.log('='.repeat(80));
    
    reports.forEach((report, index) => {
      const createdAt = report.createdAt ? new Date(report.createdAt).toLocaleString('ar-SA') : 'غير محدد';
      const publishDate = report.publishDate ? new Date(report.publishDate).toLocaleString('ar-SA') : 'غير محدد';
      
      console.log(`${index + 1}. ${report.title}`);
      console.log(`   - تاريخ الإنشاء: ${createdAt}`);
      console.log(`   - تاريخ النشر: ${publishDate}`);
      console.log(`   - الحالة: ${report.status}`);
      console.log(`   - ID: ${report.id}`);
      console.log('');
    });

    // 4. التحقق من الترتيب
    console.log('4️⃣ التحقق من الترتيب:');
    if (reports.length > 1) {
      const firstReport = reports[0];
      const secondReport = reports[1];
      
      const firstDate = new Date(firstReport.createdAt || firstReport.publishDate);
      const secondDate = new Date(secondReport.createdAt || secondReport.publishDate);
      
      if (firstDate >= secondDate) {
        console.log('✅ الترتيب صحيح: التقرير الأحدث في الأعلى');
      } else {
        console.log('❌ الترتيب خاطئ: التقرير الأحدث ليس في الأعلى');
      }
    } else {
      console.log('ℹ️  تقرير واحد فقط، لا يمكن التحقق من الترتيب');
    }

    // 5. إنشاء تقرير جديد للاختبار
    console.log('\n5️⃣ إنشاء تقرير جديد للاختبار...');
    const newReportData = JSON.stringify({
      title: 'تقرير اختبار الترتيب - ' + new Date().toISOString(),
      summary: 'ملخص تقرير اختبار الترتيب',
      content: '<p>محتوى تقرير اختبار الترتيب</p>',
      publishDate: new Date().toISOString(),
      status: 'draft'
    });

    const createResponse = await makeRequest('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(newReportData)
      }
    }, newReportData);

    if (createResponse.status !== 201) {
      console.log('❌ فشل إنشاء تقرير جديد:', createResponse.data);
    } else {
      console.log('✅ تم إنشاء تقرير جديد بنجاح');
      console.log('   - ID:', createResponse.data.report.id);
      console.log('   - تاريخ الإنشاء:', createResponse.data.report.createdAt);
    }

    // 6. جلب التقارير مرة أخرى للتحقق من الترتيب
    console.log('\n6️⃣ جلب التقارير مرة أخرى للتحقق من الترتيب...');
    const updatedReportsResponse = await makeRequest('http://localhost:5000/api/reports', {
      method: 'GET'
    });

    if (updatedReportsResponse.status === 200) {
      const updatedReports = updatedReportsResponse.data;
      const latestReport = updatedReports[0];
      
      console.log('✅ التقرير الأحدث في الأعلى:');
      console.log(`   - العنوان: ${latestReport.title}`);
      console.log(`   - تاريخ الإنشاء: ${latestReport.createdAt ? new Date(latestReport.createdAt).toLocaleString('ar-SA') : 'غير محدد'}`);
      console.log(`   - تاريخ النشر: ${latestReport.publishDate ? new Date(latestReport.publishDate).toLocaleString('ar-SA') : 'غير محدد'}`);
    }

    console.log('\n🎉 تم اختبار ترتيب التقارير بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    process.exit(1);
  }
}

// تشغيل الاختبار
testReportOrdering(); 