const fetch = require('node-fetch');

async function testSectionsAPI() {
  console.log('🔍 اختبار API الأقسام...\n');

  try {
    console.log('اختبار /api/sections...');
    const response = await fetch('http://localhost:5000/api/sections');
    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ناجح - عدد الأقسام: ${data.length}`);
    } else {
      const errorData = await response.text();
      console.log(`❌ فشل:`, errorData);
    }
  } catch (error) {
    console.log(`❌ خطأ:`, error.message);
  }
}

testSectionsAPI(); 