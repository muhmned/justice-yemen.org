// اختبار إضافة تقرير مع userId
const testAddReportWithUser = async () => {
  console.log('=== اختبار إضافة تقرير مع userId ===');
  
  try {
    // أولاً تسجيل الدخول للحصول على token
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('استجابة تسجيل الدخول:', loginData);

    if (!loginResponse.ok || !loginData.token) {
      console.log('❌ فشل في تسجيل الدخول');
      return;
    }

    console.log('✅ تم تسجيل الدخول بنجاح');
    console.log('Token:', loginData.token.substring(0, 20) + '...');
    console.log('User ID:', loginData.user.id);

    // إضافة تقرير جديد
    const reportData = {
      title: 'تقرير اختبار مع userId',
      summary: 'هذا تقرير اختبار للتأكد من حفظ userId',
      content: 'محتوى التقرير للاختبار',
      publishDate: new Date().toISOString(),
      status: 'published'
    };

    console.log('بيانات التقرير المرسلة:', reportData);

    const reportResponse = await fetch('http://localhost:5000/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${loginData.token}`
      },
      body: JSON.stringify(reportData)
    });

    const reportResult = await reportResponse.json();
    console.log('استجابة إضافة التقرير:', reportResult);

    if (reportResponse.ok) {
      console.log('✅ تم إضافة التقرير بنجاح');
      console.log('التقرير المضاف:', reportResult.report);
      
      // التحقق من أن التقرير يحتوي على userId
      if (reportResult.report.userId) {
        console.log('✅ التقرير يحتوي على userId:', reportResult.report.userId);
      } else {
        console.log('❌ التقرير لا يحتوي على userId');
      }
    } else {
      console.log('❌ فشل في إضافة التقرير:', reportResult.error);
    }

    // جلب جميع التقارير للتحقق من الترتيب
    const reportsResponse = await fetch('http://localhost:5000/api/reports', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    const reportsData = await reportsResponse.json();
    console.log('جميع التقارير:', reportsData);

    if (reportsResponse.ok && reportsData.length > 0) {
      console.log('✅ تم جلب التقارير بنجاح');
      console.log('عدد التقارير:', reportsData.length);
      console.log('أول تقرير:', reportsData[0].title);
      console.log('تاريخ إنشاء أول تقرير:', reportsData[0].createdAt);
      
      // التحقق من الترتيب (الأحدث أولاً)
      const dates = reportsData.map(r => new Date(r.createdAt));
      const isOrdered = dates.every((date, i) => i === 0 || date <= dates[i - 1]);
      console.log('هل التقارير مرتبة حسب التاريخ؟', isOrdered);
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
};

// تشغيل الاختبار
testAddReportWithUser(); 