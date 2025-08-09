const fetch = require('node-fetch');

async function testFrontendArticles() {
  try {
    console.log('🔍 اختبار عرض المقالات في الواجهة الأمامية...\n');

    // 1. اختبار جلب المقالات
    console.log('📄 جلب المقالات من API:');
    const articlesResponse = await fetch('http://localhost:5000/api/articles');
    const articles = await articlesResponse.json();
    
    console.log(`  تم جلب ${articles.length} مقال`);
    
    // 2. فحص هيكل البيانات
    if (articles.length > 0) {
      const firstArticle = articles[0];
      console.log('\n📋 هيكل بيانات المقال الأول:');
      console.log(`  العنوان: ${firstArticle.title}`);
      console.log(`  ID: ${firstArticle.id}`);
      console.log(`  sectionId: ${firstArticle.sectionId}`);
      console.log(`  Section موجود: ${!!firstArticle.Section}`);
      console.log(`  User موجود: ${!!firstArticle.User}`);
      
      if (firstArticle.Section) {
        console.log(`  اسم القسم: ${firstArticle.Section.name}`);
        console.log(`  slug القسم: ${firstArticle.Section.slug}`);
      }
      
      if (firstArticle.User) {
        console.log(`  اسم المستخدم: ${firstArticle.User.username}`);
      }
    }

    // 3. اختبار جلب الأقسام
    console.log('\n📂 جلب الأقسام:');
    const sectionsResponse = await fetch('http://localhost:5000/api/sections');
    const sections = await sectionsResponse.json();
    
    console.log(`  تم جلب ${sections.length} قسم`);
    sections.forEach(section => {
      console.log(`    - ${section.name} (${section.slug})`);
    });

    // 4. اختبار صفحة قسم معين
    if (sections.length > 0) {
      const testSection = sections[0];
      console.log(`\n🔗 اختبار صفحة القسم: ${testSection.name}`);
      console.log(`  URL: http://localhost:3000/sections/${testSection.slug}`);
      
      // حساب عدد المقالات في هذا القسم
      const articlesInSection = articles.filter(article => 
        article.Section && article.Section.id === testSection.id
      );
      
      console.log(`  عدد المقالات في هذا القسم: ${articlesInSection.length}`);
      
      if (articlesInSection.length > 0) {
        console.log('  المقالات في هذا القسم:');
        articlesInSection.forEach(article => {
          console.log(`    - ${article.title}`);
        });
      }
    }

    // 5. فحص المشاكل المحتملة
    console.log('\n⚠️ فحص المشاكل المحتملة:');
    
    const articlesWithoutSection = articles.filter(article => !article.Section);
    if (articlesWithoutSection.length > 0) {
      console.log(`  مقالات بدون قسم: ${articlesWithoutSection.length}`);
      articlesWithoutSection.forEach(article => {
        console.log(`    - ${article.title} (ID: ${article.id})`);
      });
    } else {
      console.log('  ✅ جميع المقالات مرتبطة بأقسام');
    }

    const articlesWithoutUser = articles.filter(article => !article.User);
    if (articlesWithoutUser.length > 0) {
      console.log(`  مقالات بدون مستخدم: ${articlesWithoutUser.length}`);
    } else {
      console.log('  ✅ جميع المقالات مرتبطة بمستخدمين');
    }

    console.log('\n✅ انتهى الاختبار بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
}

testFrontendArticles(); 