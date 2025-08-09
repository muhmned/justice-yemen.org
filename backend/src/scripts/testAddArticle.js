const fetch = require('node-fetch');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api/articles';
const ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMDQ0MTY4NC00NjcxLTQxNWItOGRjZC05NGQwNGI4OGYwZWQiLCJ1c2VybmFtZSI6ImFkbWluIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUyMDcwMDc1LCJleHAiOjE3NTIxNTY0NzV9.iTdF9NCeIqczTZoHgDF8P5OaV0lkvIloIvtlhE6Olgo';

async function testAddArticle() {
  const formData = new FormData();
  formData.append('title', 'مقال اختبار من السكريبت');
  formData.append('sectionId', '711b9b92-8c4b-4949-a9e5-89285c1858df');
  formData.append('content', '<p>هذا محتوى مقال تجريبي من السكريبت</p>');
  // يمكنك إضافة صورة هكذا إذا أردت:
  // formData.append('image', fs.createReadStream('path/to/image.jpg'));

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        // لا تضع Content-Type هنا! مكتبة form-data تضيفه تلقائيًا
      },
      body: formData
    });
    const data = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', data);
  } catch (err) {
    console.error('Error:', err);
  }
}

testAddArticle(); 