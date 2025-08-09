const axios = require('axios');

async function testMessageUpdate() {
  try {
    // اختبار تسجيل الدخول للحصول على التوكن
    console.log('🔐 محاولة تسجيل الدخول...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'admin123'
    });

    if (!loginResponse.data.token) {
      console.error('❌ لم يتم الحصول على التوكن');
      return;
    }

    const token = loginResponse.data.token;
    console.log('✅ تم تسجيل الدخول بنجاح');

    // اختبار جلب الرسائل
    console.log('📨 جلب الرسائل...');
    const messagesResponse = await axios.get('http://localhost:5000/api/messages', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ تم جلب الرسائل بنجاح');
    console.log(`📊 عدد الرسائل: ${messagesResponse.data.messages.length}`);

    if (messagesResponse.data.messages.length > 0) {
      const firstMessage = messagesResponse.data.messages[0];
      console.log(`🔍 اختبار تحديث الرسالة: ${firstMessage.id}`);

      // اختبار تحديث حالة الرسالة
      const updateResponse = await axios.patch(
        `http://localhost:5000/api/messages/${firstMessage.id}/status`,
        {
          status: 'READ',
          isRead: true
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ تم تحديث الرسالة بنجاح');
      console.log('📝 الرسالة المحدثة:', updateResponse.data);
    } else {
      console.log('⚠️ لا توجد رسائل للاختبار');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
    if (error.response) {
      console.error('📋 تفاصيل الخطأ:', error.response.data);
    }
  }
}

testMessageUpdate();
