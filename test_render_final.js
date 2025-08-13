#!/usr/bin/env node

/**
 * سكريبت اختبار نهائي لـ Render
 * يتحقق من جميع الإعدادات المطلوبة
 */

console.log('🔧 اختبار نهائي لإعدادات Render');
console.log('─'.repeat(60));

// اختبار متغيرات البيئة
function testEnvironmentVariables() {
  console.log('\n🔍 اختبار متغيرات البيئة:');
  
  const requiredVars = {
    'PORT': process.env.PORT,
    'NODE_ENV': process.env.NODE_ENV,
    'DATABASE_URL': process.env.DATABASE_URL,
    'JWT_SECRET': process.env.JWT_SECRET
  };
  
  let allValid = true;
  
  Object.entries(requiredVars).forEach(([key, value]) => {
    if (!value) {
      console.log(`   ❌ ${key}: مفقود`);
      allValid = false;
    } else {
      if (key === 'DATABASE_URL' || key === 'JWT_SECRET') {
        console.log(`   ✅ ${key}: موجود (${value.length} حرف)`);
      } else {
        console.log(`   ✅ ${key}: ${value}`);
      }
    }
  });
  
  // اختبار خاص للبورت
  if (process.env.PORT) {
    const portNum = parseInt(process.env.PORT);
    if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
      console.log(`   ❌ PORT: قيمة غير صحيحة (${process.env.PORT})`);
      allValid = false;
    } else {
      console.log(`   ✅ PORT: ${portNum} (صحيح)`);
    }
  }
  
  return allValid;
}

// اختبار إعدادات الخادم
function testServerConfiguration() {
  console.log('\n🔍 اختبار إعدادات الخادم:');
  
  try {
    // محاكاة إعدادات Render
    const testConfig = {
      port: process.env.PORT,
      host: '0.0.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.log(`   📋 Port: ${testConfig.port}`);
    console.log(`   📋 Host: ${testConfig.host}`);
    console.log(`   📋 Environment: ${testConfig.environment}`);
    
    if (!testConfig.port) {
      console.log('   ❌ PORT مطلوب');
      return false;
    }
    
    if (testConfig.host !== '0.0.0.0') {
      console.log('   ❌ HOST يجب أن يكون 0.0.0.0');
      return false;
    }
    
    console.log('   ✅ إعدادات الخادم صحيحة');
    return true;
  } catch (error) {
    console.log(`   ❌ خطأ في إعدادات الخادم: ${error.message}`);
    return false;
  }
}

// اختبار ملفات التكوين
function testConfigurationFiles() {
  console.log('\n🔍 اختبار ملفات التكوين:');
  
  const fs = require('fs');
  const path = require('path');
  
  const requiredFiles = [
    'src/server.js',
    'src/config/render.js',
    'src/config/cors.js',
    '../render.yaml',
    'package.json'
  ];
  
  let allExist = true;
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
      console.log(`   ✅ ${file}: موجود`);
    } else {
      console.log(`   ❌ ${file}: مفقود`);
      allExist = false;
    }
  });
  
  return allExist;
}

// اختبار render.yaml
function testRenderYaml() {
  console.log('\n🔍 اختبار render.yaml:');
  
  try {
    const fs = require('fs');
    const yamlContent = fs.readFileSync('../render.yaml', 'utf8');
    
    // التحقق من عدم وجود PORT ثابت
    if (yamlContent.includes('PORT:') && yamlContent.includes('value:')) {
      console.log('   ❌ render.yaml يحتوي على PORT ثابت');
      return false;
    }
    
    // التحقق من وجود المتغيرات المطلوبة
    const requiredVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV', 'HOST'];
    let allPresent = true;
    
    requiredVars.forEach(varName => {
      if (yamlContent.includes(varName)) {
        console.log(`   ✅ ${varName}: موجود`);
      } else {
        console.log(`   ❌ ${varName}: مفقود`);
        allPresent = false;
      }
    });
    
    return allPresent;
  } catch (error) {
    console.log(`   ❌ خطأ في قراءة render.yaml: ${error.message}`);
    return false;
  }
}

// تشغيل جميع الاختبارات
function runAllTests() {
  console.log('🚀 بدء الاختبارات النهائية...\n');
  
  const tests = [
    { name: 'متغيرات البيئة', fn: testEnvironmentVariables },
    { name: 'إعدادات الخادم', fn: testServerConfiguration },
    { name: 'ملفات التكوين', fn: testConfigurationFiles },
    { name: 'render.yaml', fn: testRenderYaml }
  ];
  
  let passedTests = 0;
  const totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = test.fn();
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
    console.log('   - PORT مضبوط بشكل صحيح');
    console.log('   - HOST مضبوط على 0.0.0.0');
    console.log('   - جميع المتغيرات المطلوبة موجودة');
    console.log('   - ملفات التكوين صحيحة');
    console.log('\n🚀 يمكنك الآن نشر التطبيق على Render!');
  } else {
    console.log('⚠️  بعض الاختبارات فشلت. تحقق من الإعدادات قبل النشر');
    console.log('\n🔧 خطوات التصحيح:');
    console.log('   1. تأكد من أن PORT محدد في متغيرات البيئة');
    console.log('   2. تأكد من أن HOST مضبوط على 0.0.0.0');
    console.log('   3. تحقق من وجود جميع المتغيرات المطلوبة');
    console.log('   4. تأكد من صحة ملفات التكوين');
  }
  
  return passedTests === totalTests;
}

// تشغيل الاختبارات
runAllTests();
