const fetch = require('node-fetch');

async function testFrontendData() {
  console.log('🔍 اختبار البيانات للواجهة الأمامية...\n');

  try {
    // اختبار البيانات التي تحتاجها الصفحة الرئيسية
    console.log('1. اختبار Basic Info Home...');
    const homeRes = await fetch('http://localhost:5000/api/basic-info/home');
    const homeData = await homeRes.json();
    console.log('✅ Basic Info:', {
      title: homeData.title,
      hasContent: !!homeData.content,
      hasImage: !!homeData.image
    });

    console.log('\n2. اختبار News (الأخبار المنشورة فقط)...');
    const newsRes = await fetch('http://localhost:5000/api/news');
    const newsData = await newsRes.json();
    const publishedNews = newsData.filter(news => news.status === 'published');
    console.log(`✅ News: ${publishedNews.length} خبر منشور من أصل ${newsData.length}`);
    
    if (publishedNews.length > 0) {
      console.log('   مثال على خبر منشور:', {
        title: publishedNews[0].title,
        hasImage: !!publishedNews[0].image,
        hasSummary: !!publishedNews[0].summary
      });
    }

    console.log('\n3. اختبار Reports...');
    const reportsRes = await fetch('http://localhost:5000/api/reports');
    const reportsData = await reportsRes.json();
    console.log(`✅ Reports: ${reportsData.length} تقرير`);
    
    if (reportsData.length > 0) {
      console.log('   مثال على تقرير:', {
        title: reportsData[0].title,
        hasPdfUrl: !!reportsData[0].pdfUrl,
        hasThumbnail: !!reportsData[0].thumbnail
      });
    }

    console.log('\n4. اختبار Sections...');
    const sectionsRes = await fetch('http://localhost:5000/api/sections');
    const sectionsData = await sectionsRes.json();
    console.log(`✅ Sections: ${sectionsData.length} قسم`);

    console.log('\n5. اختبار Settings...');
    const settingsRes = await fetch('http://localhost:5000/api/settings');
    const settingsData = await settingsRes.json();
    console.log('✅ Settings:', Object.keys(settingsData));

    console.log('\n6. اختبار Contact Info...');
    const contactRes = await fetch('http://localhost:5000/api/contact/info');
    const contactData = await contactRes.json();
    console.log('✅ Contact Info:', Object.keys(contactData));

    console.log('\n📊 ملخص البيانات المتاحة للصفحة الرئيسية:');
    console.log(`- الأخبار المنشورة: ${publishedNews.length}`);
    console.log(`- التقارير: ${reportsData.length}`);
    console.log(`- الأقسام: ${sectionsData.length}`);
    console.log(`- بيانات الصفحة الرئيسية: ${homeData.title ? 'موجودة' : 'غير موجودة'}`);

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

testFrontendData(); 