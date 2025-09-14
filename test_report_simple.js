// اختبار بسيط لنظام التقارير
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

async function testReportSystem() {
  console.log('🧪 اختبار نظام التقارير...\n');

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

    // 2. إنشاء تقرير بدون ملفات (للاختبار)
    console.log('2️⃣ إنشاء تقرير تجريبي...');
    const reportData = JSON.stringify({
      title: 'تقرير اختبار - ' + new Date().toISOString(),
      summary: 'ملخص تقرير الاختبار',
      content: '<p>محتوى تقرير الاختبار</p>',
      publishDate: new Date().toISOString(),
      status: 'draft'
    });

    const reportResponse = await makeRequest('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(reportData)
      }
    }, reportData);

    if (reportResponse.status !== 201) {
      console.log('❌ فشل إنشاء التقرير:', reportResponse.data);
      throw new Error(`فشل إنشاء التقرير: ${reportResponse.status}`);
    }

    const reportId = reportResponse.data.report.id;
    console.log('✅ تم إنشاء التقرير بنجاح:', reportId, '\n');

    // 3. جلب التقرير
    console.log('3️⃣ جلب التقرير...');
    const getReportResponse = await makeRequest(`http://localhost:5000/api/reports/${reportId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (getReportResponse.status !== 200) {
      throw new Error(`فشل جلب التقرير: ${getReportResponse.status}`);
    }

    const savedReport = getReportResponse.data;
    console.log('✅ تم جلب التقرير بنجاح');
    console.log('   - العنوان:', savedReport.title);
    console.log('   - الصورة:', savedReport.thumbnail || 'غير موجودة');
    console.log('   - PDF:', savedReport.pdfUrl || 'غير موجود');
    console.log('   - المحتوى:', savedReport.content ? 'موجود' : 'غير موجود');

    // 4. جلب جميع التقارير
    console.log('\n4️⃣ جلب جميع التقارير...');
    const getAllReportsResponse = await makeRequest('http://localhost:5000/api/reports', {
      method: 'GET'
    });

    if (getAllReportsResponse.status !== 200) {
      throw new Error(`فشل جلب التقارير: ${getAllReportsResponse.status}`);
    }

    const reports = getAllReportsResponse.data;
    console.log(`✅ تم جلب ${reports.length} تقرير`);
    
    // عرض التقارير التي تحتوي على ملفات
    const reportsWithFiles = reports.filter(r => r.thumbnail || r.pdfUrl);
    console.log(`   - التقارير مع ملفات: ${reportsWithFiles.length}`);

    console.log('\n🎉 تم اختبار نظام التقارير بنجاح!');
    console.log('\n💡 ملاحظة: لاختبار رفع الملفات، استخدم الواجهة الأمامية');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    process.exit(1);
  }
}

// تشغيل الاختبار
testReportSystem(); 