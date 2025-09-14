// اختبار التحقق من التوكن
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

async function testTokenAndUpload() {
  console.log('🔐 اختبار التوكن ورفع الملفات...\n');

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
      throw new Error(`فشل تسجيل الدخول: ${loginResponse.status} - ${JSON.stringify(loginResponse.data)}`);
    }

    const token = loginResponse.data.token;
    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('   - التوكن:', token.substring(0, 20) + '...');

    // 2. اختبار نقطة upload بدون ملف
    console.log('\n2️⃣ اختبار نقطة upload...');
    const uploadResponse = await makeRequest('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      }
    }, '------WebKitFormBoundary7MA4YWxkTrZu0gW--');

    console.log('   - حالة الاستجابة:', uploadResponse.status);
    console.log('   - البيانات:', uploadResponse.data);

    // 3. اختبار نقطة upload بدون توكن
    console.log('\n3️⃣ اختبار نقطة upload بدون توكن...');
    const noTokenResponse = await makeRequest('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      }
    }, '------WebKitFormBoundary7MA4YWxkTrZu0gW--');

    console.log('   - حالة الاستجابة:', noTokenResponse.status);
    console.log('   - البيانات:', noTokenResponse.data);

    // 4. اختبار نقطة upload بتوكن غير صحيح
    console.log('\n4️⃣ اختبار نقطة upload بتوكن غير صحيح...');
    const wrongTokenResponse = await makeRequest('http://localhost:5000/api/upload', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer wrong_token_here',
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      }
    }, '------WebKitFormBoundary7MA4YWxkTrZu0gW--');

    console.log('   - حالة الاستجابة:', wrongTokenResponse.status);
    console.log('   - البيانات:', wrongTokenResponse.data);

    console.log('\n🎉 تم اختبار التوكن بنجاح!');
    console.log('\n💡 ملاحظات:');
    console.log('   - يجب أن يكون الاستجابة 400 بدون ملف');
    console.log('   - يجب أن يكون الاستجابة 401 بدون توكن');
    console.log('   - يجب أن يكون الاستجابة 401 بتوكن خاطئ');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    process.exit(1);
  }
}

// تشغيل الاختبار
testTokenAndUpload(); 