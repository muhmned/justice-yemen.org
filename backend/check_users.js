const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    
    console.log('المستخدمون الموجودون:');
    users.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - ${user.status}`);
    });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 