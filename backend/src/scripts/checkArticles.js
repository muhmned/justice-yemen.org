const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkArticles() {
  try {
    console.log('🔍 فحص المقالات في قاعدة البيانات...');
    
    // فحص عدد المقالات
    const articleCount = await prisma.article.count();
    console.log(`📊 عدد المقالات: ${articleCount}`);
    
    if (articleCount > 0) {
      // جلب جميع المقالات مع تفاصيلها
      const articles = await prisma.article.findMany({
        include: {
          section: true,
          user: true
        },
        orderBy: { publishDate: 'desc' }
      });
      
      console.log('\n📋 تفاصيل المقالات:');
      articles.forEach((article, index) => {
        console.log(`\n--- مقال ${index + 1} ---`);
        console.log(`ID: ${article.id}`);
        console.log(`العنوان: ${article.title}`);
        console.log(`المحتوى: ${article.content ? article.content.substring(0, 50) + '...' : 'لا يوجد محتوى'}`);
        console.log(`تاريخ النشر: ${article.publishDate}`);
        console.log(`الحالة: ${article.status}`);
        console.log(`القسم: ${article.section ? article.section.name : 'غير محدد'}`);
        console.log(`المستخدم: ${article.user ? article.user.username : 'غير محدد'}`);
        console.log(`الصورة: ${article.imageUrl || 'لا توجد صورة'}`);
      });
    } else {
      console.log('❌ لا توجد مقالات في قاعدة البيانات');
    }
    
    // فحص الأقسام
    const sectionCount = await prisma.section.count();
    console.log(`\n📊 عدد الأقسام: ${sectionCount}`);
    
    if (sectionCount > 0) {
      const sections = await prisma.section.findMany();
      console.log('\n📋 الأقسام المتاحة:');
      sections.forEach(section => {
        console.log(`- ${section.name} (ID: ${section.id})`);
      });
    }
    
    // فحص المستخدمين
    const userCount = await prisma.user.count();
    console.log(`\n📊 عدد المستخدمين: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany();
      console.log('\n📋 المستخدمون المتاحون:');
      users.forEach(user => {
        console.log(`- ${user.username} (ID: ${user.id}, Role: ${user.role})`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص المقالات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkArticles(); 