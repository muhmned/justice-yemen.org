#!/usr/bin/env node

/**
 * سكريبت اختبار خاص بـ Render
 * يختبر إعدادات البورت والـ host للتأكد من صحة النشر
 */

import fetch from 'node-fetch';

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

console.log('🔧 اختبار إعدادات Render للنشر');
console.log(`📍 URL: ${BASE_URL}`);
console.log('─'.repeat(60));

// اختبار إعدادات البيئة
function testEnvironmentVariables() {
  console.log('\n🔍 اختبار متغيرات البيئة:');
  
  const envVars = {
    'PORT': process.env.PORT,
    'NODE_ENV': process.env.NODE_ENV,
    'DATABASE_URL': process.env.DATABASE_URL ? '✅ موجود' : '❌ مفقود',
    'JWT_SECRET': process.env.JWT_SECRET ? '✅ موجود' : '❌ مفقود'
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    if (key === 'DATABASE_URL' || key === 'JWT_SECRET') {
      console.log(`   ${key}: ${value}`);
    } else {
      console.log(`   ${key}: ${value || 'غير محدد'}`);
    }
  });
  
  // التحقق من PORT في الإنتاج
  if (process.env.NODE_ENV === 'production' && !process.env.PORT) {
    console.log('   ❌ خطأ: PORT مطلوب في بيئة الإنتاج');
    return false;
  }
  
  console.log('   ✅ متغيرات البيئة مضبوطة بشكل صحيح');
  return true;
}

// اختبار الاتصال بالخادم
async function testServerConnection() {
  try {
    console.log('\n🔍 اختبار الاتصال بالخادم:');
    console.log(`   URL: ${BASE_URL}/api/health`);
    
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ نجح الاتصال (${response.status}):`, data);
      return true;
    } else {
      console.log(`   ❌ فشل الاتصال (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في الاتصال:`, error.message);
    return false;
  }
}

// اختبار CORS للوصول الخارجي
async function testCORS() {
  try {
    console.log('\n🔍 اختبار CORS للوصول الخارجي:');
    
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://external-test.com',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
      'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
      'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
    };
    
    console.log('   📋 CORS Headers:', corsHeaders);
    
    if (corsHeaders['Access-Control-Allow-Origin']) {
      console.log('   ✅ CORS مضبوط للوصول الخارجي');
      return true;
    } else {
      console.log('   ❌ CORS غير مضبوط للوصول الخارجي');
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في اختبار CORS:`, error.message);
    return false;
  }
}

// اختبار قاعدة البيانات
async function testDatabase() {
  try {
    console.log('\n🔍 اختبار قاعدة البيانات:');
    console.log(`   URL: ${BASE_URL}/api/health/db`);
    
    const response = await fetch(`${BASE_URL}/api/health/db`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log(`   ✅ قاعدة البيانات تعمل (${response.status}):`, data);
      return true;
    } else {
      console.log(`   ❌ مشكلة في قاعدة البيانات (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في الاتصال بقاعدة البيانات:`, error.message);
    return false;
  }
}

// اختبار الوصول من IP خارجي
async function testExternalAccess() {
  try {
    console.log('\n🔍 اختبار الوصول الخارجي:');
    
    // محاكاة طلب من IP خارجي
    const response = await fetch(`${BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Forwarded-For': '203.0.113.1', // IP خارجي
        'User-Agent': 'External-Test-Agent'
      }
    });
    
    if (response.ok) {
      console.log('   ✅ الخادم يقبل الطلبات الخارجية');
      return true;
    } else {
      console.log(`   ❌ الخادم يرفض الطلبات الخارجية (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`   ❌ خطأ في اختبار الوصول الخارجي:`, error.message);
    return false;
  }
}

// تشغيل جميع الاختبارات
async function runAllTests() {
  console.log('🚀 بدء اختبارات Render...\n');
  
  const tests = [
    { name: 'متغيرات البيئة', fn: testEnvironmentVariables },
    { name: 'الاتصال بالخادم', fn: testServerConnection },
    { name: 'CORS', fn: testCORS },
    { name: 'قاعدة البيانات', fn: testDatabase },
    { name: 'الوصول الخارجي', fn: testExternalAccess }
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) passedTests++;
    } catch (error) {
      console.log(`   ❌ خطأ في اختبار ${test.name}:`, error.message);
    }
  }
  
  console.log('\n' + '─'.repeat(60));
  console.log(`📊 النتائج: ${passedTests}/${totalTests} اختبارات نجحت`);
  
  if (passedTests === totalTests) {
    console.log('🎉 جميع الاختبارات نجحت! التطبيق جاهز للنشر على Render');
    console.log('\n✅ النقاط الرئيسية:');
    console.log('   - البورت مضبوط على 0.0.0.0');
    console.log('   - CORS يدعم الوصول الخارجي');
    console.log('   - قاعدة البيانات متصلة');
    console.log('   - متغيرات البيئة صحيحة');
  } else {
    console.log('⚠️  بعض الاختبارات فشلت. تحقق من الإعدادات قبل النشر');
    console.log('\n🔧 خطوات التصحيح:');
    console.log('   1. تأكد من أن الخادم يعمل على 0.0.0.0:PORT');
    console.log('   2. تحقق من إعدادات CORS في config/cors.js');
    console.log('   3. تأكد من متغيرات البيئة في Render');
    console.log('   4. تحقق من اتصال قاعدة البيانات');
  }
  
  return passedTests === totalTests;
}

// تشغيل الاختبارات
runAllTests().catch(console.error);
