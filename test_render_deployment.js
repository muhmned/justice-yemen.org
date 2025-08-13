#!/usr/bin/env node

/**
 * سكريبت اختبار لنشر Render
 * يختبر إعدادات الخادم للتأكد من أنه يعمل بشكل صحيح
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

console.log('🧪 اختبار إعدادات الخادم للنشر على Render');
console.log(`📍 URL: ${BASE_URL}`);
console.log('─'.repeat(50));

async function testEndpoint(endpoint, description) {
  try {
    console.log(`\n🔍 اختبار: ${description}`);
    console.log(`   URL: ${BASE_URL}${endpoint}`);
    
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log(`   ✅ نجح (${response.status}):`, data);
      return true;
    } else {
      console.log(`   ❌ فشل (${response.status}):`, data);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في الاتصال:`, error.message);
    return false;
  }
}

async function testCORS() {
  try {
    console.log(`\n🔍 اختبار CORS`);
    console.log(`   URL: ${BASE_URL}/api/health`);
    
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://test-external-domain.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log(`   📋 CORS Headers:`, corsHeaders);
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log(`   ✅ CORS مضبوط بشكل صحيح`);
      return true;
    } else {
      console.log(`   ❌ CORS غير مضبوط`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في اختبار CORS:`, error.message);
    return false;
  }
}

async function runTests() {
  const tests = [
    { endpoint: '/api/health', description: 'اختبار الصحة العامة' },
    { endpoint: '/api/health/db', description: 'اختبار الاتصال بقاعدة البيانات' },
    { endpoint: '/api/users', description: 'اختبار API المستخدمين' }
  ];
  
  let passedTests = 0;
  const totalTests = tests.length + 1; // +1 for CORS test
  
  // اختبار النقاط النهائية
  for (const test of tests) {
    const result = await testEndpoint(test.endpoint, test.description);
    if (result) passedTests++;
  }
  
  // اختبار CORS
  const corsResult = await testCORS();
  if (corsResult) passedTests++;
  
  console.log('\n' + '─'.repeat(50));
  console.log(`📊 النتائج: ${passedTests}/${totalTests} اختبارات نجحت`);
  
  if (passedTests === totalTests) {
    console.log('🎉 جميع الاختبارات نجحت! الخادم جاهز للنشر على Render');
  } else {
    console.log('⚠️  بعض الاختبارات فشلت. تحقق من الإعدادات قبل النشر');
  }
  
  // نصائح إضافية
  console.log('\n💡 نصائح للنشر على Render:');
  console.log('   1. تأكد من أن HOST مضبوط على "0.0.0.0"');
  console.log('   2. تأكد من أن NODE_ENV مضبوط على "production"');
  console.log('   3. تحقق من متغيرات البيئة في Render');
  console.log('   4. أضف نطاق التطبيق إلى allowedOrigins في config/cors.js');
}

// تشغيل الاختبارات
runTests().catch(console.error);
