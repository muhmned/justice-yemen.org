const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
  } catch (err) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 