const { PrismaClient } = require('./backend/node_modules/@prisma/client');

const prisma = new PrismaClient();

async function testArticlesSections() {
  try {
    console.log('🔍 فحص علاقة المقالات بالأقسام...\n');

    // 1. فحص جميع الأقسام
    console.log('📋 الأقسام الموجودة:');
    const sections = await prisma.section.findMany();
    sections.forEach(section => {
      console.log(`  - ${section.name} (ID: ${section.id})`);
    });

    console.log('\n📄 المقالات الموجودة:');
    const articles = await prisma.article.findMany({
      include: {
        Section: true,
        User: true
      }
    });

    articles.forEach(article => {
      console.log(`\n  المقال: ${article.title}`);
      console.log(`    ID: ${article.id}`);
      console.log(`    sectionId: ${article.sectionId}`);
      console.log(`    القسم: ${article.Section ? article.Section.name : 'غير محدد'}`);
      console.log(`    المستخدم: ${article.User ? article.User.username : 'غير محدد'}`);
    });

    // 2. فحص المقالات بدون قسم
    console.log('\n⚠️ المقالات بدون قسم:');
    const articlesWithoutSection = await prisma.article.findMany({
      where: {
        sectionId: null
      }
    });

    if (articlesWithoutSection.length === 0) {
      console.log('  لا توجد مقالات بدون قسم');
    } else {
      articlesWithoutSection.forEach(article => {
        console.log(`  - ${article.title} (ID: ${article.id})`);
      });
    }

    // 3. فحص الأقسام بدون مقالات
    console.log('\n📂 الأقسام بدون مقالات:');
    const sectionsWithoutArticles = await prisma.section.findMany({
      where: {
        Article: {
          none: {}
        }
      }
    });

    if (sectionsWithoutArticles.length === 0) {
      console.log('  لا توجد أقسام بدون مقالات');
    } else {
      sectionsWithoutArticles.forEach(section => {
        console.log(`  - ${section.name} (ID: ${section.id})`);
      });
    }

    // 4. إحصائيات
    console.log('\n📊 الإحصائيات:');
    const totalArticles = await prisma.article.count();
    const totalSections = await prisma.section.count();
    const articlesWithSection = await prisma.article.count({
      where: {
        sectionId: {
          not: null
        }
      }
    });

    console.log(`  إجمالي المقالات: ${totalArticles}`);
    console.log(`  إجمالي الأقسام: ${totalSections}`);
    console.log(`  المقالات المرتبطة بقسم: ${articlesWithSection}`);
    console.log(`  المقالات بدون قسم: ${totalArticles - articlesWithSection}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testArticlesSections(); 