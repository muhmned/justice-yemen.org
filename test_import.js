const fs = require('fs');
const path = require('path');

// اختبار استيراد النسخة الاحتياطية
async function testImport() {
  try {
    console.log('🔍 فحص مجلد النسخ الاحتياطية...');
    
    const backupDir = path.join(__dirname, 'backend/backups');
    
    if (!fs.existsSync(backupDir)) {
      console.log('❌ مجلد النسخ الاحتياطية غير موجود');
      return;
    }
    
    const files = fs.readdirSync(backupDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`📁 عدد ملفات النسخ الاحتياطية: ${jsonFiles.length}`);
    
    if (jsonFiles.length === 0) {
      console.log('❌ لا توجد ملفات نسخ احتياطية');
      return;
    }
    
    // اختبار أول ملف
    const testFile = path.join(backupDir, jsonFiles[0]);
    console.log(`📄 اختبار الملف: ${jsonFiles[0]}`);
    
    const fileContent = fs.readFileSync(testFile, 'utf8');
    const backupData = JSON.parse(fileContent);
    
    console.log('✅ تم قراءة الملف بنجاح');
    console.log('📊 محتويات الملف:');
    console.log('  - المفاتيح:', Object.keys(backupData));
    console.log('  - البيانات الوصفية:', backupData.metadata);
    
    if (backupData.users) {
      console.log(`  - عدد المستخدمين: ${backupData.users.length}`);
    }
    
    if (backupData.sections) {
      console.log(`  - عدد الأقسام: ${backupData.sections.length}`);
    }
    
    if (backupData.articles) {
      console.log(`  - عدد المقالات: ${backupData.articles.length}`);
    }
    
    console.log('\n🎯 اختبار API الاستيراد...');
    
    // اختبار API
    const FormData = require('form-data');
    const fetch = require('node-fetch');
    
    const form = new FormData();
    form.append('file', fs.createReadStream(testFile));
    
    const response = await fetch('http://localhost:5000/api/import', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE' // تحتاج لـ token صالح
      },
      body: form
    });
    
    console.log('📡 استجابة API:');
    console.log('  - الحالة:', response.status);
    console.log('  - النص:', await response.text());
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار
testImport(); 