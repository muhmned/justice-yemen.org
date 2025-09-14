const fetch = require('node-fetch');

async function testReportsAPI() {
  console.log('🔍 اختبار API التقارير...\n');

  try {
    console.log('اختبار /api/reports...');
    const response = await fetch('http://localhost:5000/api/reports');
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ناجح - عدد التقارير: ${data.length}`);
    } else {
      const errorData = await response.text();
      console.log(`❌ فشل:`, errorData);
    }
  } catch (error) {
    console.log(`❌ خطأ:`, error.message);
  }
}

testReportsAPI(); 