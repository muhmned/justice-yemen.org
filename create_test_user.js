const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const username = 'testuser';
    const password = 'testuser123';
    const email = 'test@test.com';
    const role = 'editor';

    // تحقق إذا كان المستخدم موجود مسبقًا
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log('المستخدم testuser موجود بالفعل.');
      return;
    }

    // تشفير كلمة المرور
    const passwordHash = await bcrypt.hash(password, 10);

    // إدخال المستخدم
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
        email,
        role,
      },
    });
    
    console.log('✅ تم إدخال مستخدم testuser بنجاح.');
    console.log('المعرف:', user.id);
    console.log('اسم المستخدم:', user.username);
    console.log('الدور:', user.role);
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 