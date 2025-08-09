const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // id القسم الموجود فعليًا في قاعدة البيانات
  const categoryId = '98a2c169-7374-424e-a52d-c7e62b9466a7';

  const article = await prisma.article.create({
    data: {
      title: 'مقال تجريبي',
      content: 'هذا محتوى مقال تجريبي.',
      summary: 'ملخص المقال التجريبي',
      categoryId: categoryId,
      status: 'draft',
      isFeatured: false
    }
  });

  console.log('تمت إضافة المقال:', article);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 