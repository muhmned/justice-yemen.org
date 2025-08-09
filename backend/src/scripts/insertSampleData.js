const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // إدخال قسم تجريبي
  await prisma.section.upsert({
    where: { slug: 'main-section' },
    update: {},
    create: {
      name: 'القسم الرئيسي',
      slug: 'main-section',
      status: 'active',
      order: 1,
    },
  });
  console.log('✅ تم إدخال قسم تجريبي بنجاح.');

  // إدخال سجل about في BasicInfo إذا لم يكن موجودًا
  await prisma.basicInfo.upsert({
    where: { page: 'about' },
    update: {},
    create: {
      page: 'about',
      title: 'من نحن',
      content: 'هذا نص تجريبي لصفحة من نحن.',
    },
  });
  console.log('✅ تم إدخال سجل about بنجاح.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 