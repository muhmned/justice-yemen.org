const fetch = require('node-fetch');

async function testSingleAPI() {
  console.log('🔍 اختبار API واحد فقط...\n');

  try {
    console.log('اختبار /api/news...');
    const response = await fetch('http://localhost:5000/api/news');
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ناجح - عدد الأخبار: ${data.length}`);
    } else {
      const errorData = await response.text();
      console.log(`❌ فشل:`, errorData);
    }
  } catch (error) {
    console.log(`❌ خطأ:`, error.message);
  }
}

testSingleAPI(); 