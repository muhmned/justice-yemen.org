// اختبار سريع لنظام النسخ الاحتياطية
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';
const TEST_TOKEN = 'your-test-token-here'; // استبدل بالتوكن الحقيقي

async function testBackupSystem() {
  console.log('🔍 اختبار نظام النسخ الاحتياطية...\n');

  // اختبار 1: فحص صحة الخادم
  console.log('1. اختبار صحة الخادم...');
  try {
    const healthResponse = await fetch(`${BASE_URL}/api/health`);
    const healthData = await healthResponse.json();
    console.log('✅ الخادم يعمل:', healthData);
  } catch (error) {
    console.log('❌ الخادم لا يعمل:', error.message);
    return;
  }

  // اختبار 2: فحص قاعدة البيانات
  console.log('\n2. اختبار قاعدة البيانات...');
  try {
    const dbResponse = await fetch(`${BASE_URL}/api/health/db`);
    const dbData = await dbResponse.json();
    console.log('✅ قاعدة البيانات تعمل:', dbData);
  } catch (error) {
    console.log('❌ قاعدة البيانات لا تعمل:', error.message);
    return;
  }

  // اختبار 3: اختبار إنشاء نسخة احتياطية
  console.log('\n3. اختبار إنشاء نسخة احتياطية...');
  try {
    const backupResponse = await fetch(`${BASE_URL}/api/backup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify({ type: 'sections' })
    });
    
    if (backupResponse.ok) {
      const backupData = await backupResponse.json();
      console.log('✅ تم إنشاء النسخة الاحتياطية:', backupData.message);
    } else {
      const errorData = await backupResponse.json();
      console.log('❌ فشل في إنشاء النسخة الاحتياطية:', errorData.error);
    }
  } catch (error) {
    console.log('❌ خطأ في الاتصال:', error.message);
  }

  // اختبار 4: اختبار قائمة النسخ الاحتياطية
  console.log('\n4. اختبار قائمة النسخ الاحتياطية...');
  try {
    const backupsResponse = await fetch(`${BASE_URL}/api/backups`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    if (backupsResponse.ok) {
      const backupsData = await backupsResponse.json();
      console.log('✅ تم جلب قائمة النسخ الاحتياطية:', backupsData.backups.length, 'نسخة');
    } else {
      const errorData = await backupsResponse.json();
      console.log('❌ فشل في جلب قائمة النسخ الاحتياطية:', errorData.error);
    }
  } catch (error) {
    console.log('❌ خطأ في الاتصال:', error.message);
  }

  console.log('\n🎯 انتهى الاختبار!');
}

// تشغيل الاختبار
testBackupSystem().catch(console.error); 