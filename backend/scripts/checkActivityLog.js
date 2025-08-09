const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { user: { select: { username: true, email: true } } }
  });
  console.log('آخر 50 عملية:');
  logs.forEach(log => {
    console.log(`- [${log.createdAt.toISOString()}] ${log.user ? log.user.username : 'مستخدم غير معروف'}: ${log.action} | ${log.details}`);
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect()); 