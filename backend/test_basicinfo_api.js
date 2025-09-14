const fetch = require('node-fetch');

async function testBasicInfoAPI() {
  console.log('🔍 اختبار API Basic Info...\n');

  try {
    console.log('اختبار /api/basic-info/home...');
    const response = await fetch('http://localhost:5000/api/basic-info/home');
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ناجح`);
      console.log('Data keys:', Object.keys(data));
    } else {
      const errorData = await response.text();
      console.log(`❌ فشل:`, errorData);
    }
  } catch (error) {
    console.log(`❌ خطأ:`, error.message);
  }
}

testBasicInfoAPI(); 