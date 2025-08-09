const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAbout() {
  const all = await prisma.basicInfo.findMany({ where: { page: 'about' }, orderBy: { id: 'desc' } });
  if (all.length > 1) {
    for (let i = 1; i < all.length; i++) {
      await prisma.basicInfo.delete({ where: { id: all[i].id } });
    }
    console.log('تم حذف السجلات الزائدة، والإبقاء على أحدث سجل فقط.');
  } else {
    console.log('لا يوجد إلا سجل واحد فقط.');
  }
  await prisma.$disconnect();
}

cleanAbout(); 
