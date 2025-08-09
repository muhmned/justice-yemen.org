// اختبار صفحة الأخبار
console.log('🧪 اختبار صفحة الأخبار...');

// اختبار الوصول للصفحة
async function testNewsPage() {
  try {
    // 1. اختبار الوصول للصفحة
    console.log('1. اختبار الوصول لصفحة الأخبار...');
    
    // محاكاة النقر على الرابط
    const newsLink = document.querySelector('a[href="/admin/news"]');
    if (newsLink) {
      console.log('✅ تم العثور على رابط الأخبار');
      newsLink.click();
    } else {
      console.log('❌ لم يتم العثور على رابط الأخبار');
    }
    
    // 2. اختبار تحميل البيانات
    console.log('2. اختبار تحميل بيانات الأخبار...');
    const response = await fetch('http://localhost:5000/api/news');
    const data = await response.json();
    console.log('✅ تم جلب البيانات:', Array.isArray(data) ? `${data.length} خبر` : 'خطأ في البيانات');
    
    // 3. اختبار إضافة خبر
    console.log('3. اختبار إضافة خبر جديد...');
    const token = localStorage.getItem('admin_token');
    if (token) {
      console.log('✅ تم العثور على token المصادقة');
    } else {
      console.log('❌ لم يتم العثور على token المصادقة');
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  }
}

// تشغيل الاختبار
testNewsPage(); 