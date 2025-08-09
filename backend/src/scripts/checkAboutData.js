const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const about = await prisma.basicInfo.findFirst({ where: { page: 'about' } });
  if (!about) {
    console.log('لا يوجد سجل لصفحة من نحن');
  } else {
    console.log('بيانات صفحة من نحن:');
    console.log(about);
  }
  await prisma.$disconnect();
}

main(); 