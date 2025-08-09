const fetch = require('node-fetch');

async function testHomepageAPIs() {
  console.log('🔍 اختبار APIs الصفحة الرئيسية...\n');

  const apis = [
    { name: 'Basic Info Home', url: 'http://localhost:5000/api/basic-info/home' },
    { name: 'News', url: 'http://localhost:5000/api/news' },
    { name: 'Reports', url: 'http://localhost:5000/api/reports' },
    { name: 'Sections', url: 'http://localhost:5000/api/sections' },
    { name: 'Settings', url: 'http://localhost:5000/api/settings' },
    { name: 'Contact Info', url: 'http://localhost:5000/api/contact/info' }
  ];

  for (const api of apis) {
    try {
      console.log(`🔍 اختبار ${api.name}...`);
      const response = await fetch(api.url);
      console.log(`Status: ${response.status}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${api.name} ناجح`);
        console.log(`Data:`, Array.isArray(data) ? `${data.length} items` : typeof data === 'object' ? Object.keys(data) : data);
      } else {
        const errorData = await response.json();
        console.log(`❌ ${api.name} فشل:`, errorData);
      }
    } catch (error) {
      console.log(`❌ خطأ في ${api.name}:`, error.message);
    }
    console.log('---');
  }
}

testHomepageAPIs(); 