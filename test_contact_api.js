// اختبار API الاتصال
async function testContactAPI() {
  console.log('🧪 اختبار API الاتصال');
  console.log('==================');

  const API_URL = process.env.API_URL || 'http://localhost:3001';

  try {
    // 1. اختبار جلب معلومات الاتصال
    console.log('\n1️⃣ اختبار جلب معلومات الاتصال...');
    const infoResponse = await fetch(`${API_URL}/api/contact/info`);
    
    if (infoResponse.ok) {
      const infoData = await infoResponse.json();
      console.log('✅ تم جلب معلومات الاتصال بنجاح:');
      console.log('📞 الهاتف:', infoData.phone);
      console.log('📧 البريد الإلكتروني:', infoData.email);
      console.log('📍 العنوان:', infoData.address);
      console.log('📝 الوصف:', infoData.description);
    } else {
      console.error('❌ فشل في جلب معلومات الاتصال:', infoResponse.status);
      const errorText = await infoResponse.text();
      console.error('تفاصيل الخطأ:', errorText);
    }

    // 2. اختبار إرسال رسالة اتصال
    console.log('\n2️⃣ اختبار إرسال رسالة اتصال...');
    const messageData = {
      name: 'مستخدم اختبار',
      email: 'test@example.com',
      subject: 'رسالة اختبار',
      message: 'هذه رسالة اختبار لفحص نظام الاتصال'
    };

    const sendResponse = await fetch(`${API_URL}/api/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    if (sendResponse.ok) {
      const sendData = await sendResponse.json();
      console.log('✅ تم إرسال الرسالة بنجاح:');
      console.log('📨 رسالة الاستجابة:', sendData.message);
      console.log('✅ النجاح:', sendData.success);
    } else {
      console.error('❌ فشل في إرسال الرسالة:', sendResponse.status);
      const errorData = await sendResponse.json();
      console.error('تفاصيل الخطأ:', errorData);
    }

    // 3. اختبار إرسال رسالة ببيانات غير صحيحة
    console.log('\n3️⃣ اختبار إرسال رسالة ببيانات غير صحيحة...');
    const invalidData = {
      name: '', // اسم فارغ
      email: 'invalid-email', // بريد إلكتروني غير صحيح
      subject: 'ab', // موضوع قصير جداً
      message: 'short' // رسالة قصيرة جداً
    };

    const invalidResponse = await fetch(`${API_URL}/api/contact/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidData)
    });

    if (invalidResponse.ok) {
      const invalidResponseData = await invalidResponse.json();
      console.log('⚠️ استجابة البيانات غير الصحيحة:');
      console.log('✅ النجاح:', invalidResponseData.success);
      if (invalidResponseData.errors) {
        console.log('❌ الأخطاء:', invalidResponseData.errors);
      }
    } else {
      console.error('❌ فشل في اختبار البيانات غير الصحيحة:', invalidResponse.status);
      const errorData = await invalidResponse.json();
      console.error('تفاصيل الخطأ:', errorData);
    }

    console.log('\n🎉 تم الانتهاء من جميع الاختبارات!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

// تشغيل الاختبار
testContactAPI();
