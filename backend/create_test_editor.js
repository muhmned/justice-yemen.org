const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestEditor() {
  try {
    const username = 'editor';
    const password = 'editor123456';
    const email = 'editor@test.com';
    const role = 'editor';

    // تحقق إذا كان المستخدم موجود مسبقًا
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log('المستخدم editor موجود بالفعل.');
      console.log('حاول تسجيل الدخول بكلمة المرور: editor123456');
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
    
    console.log('✅ تم إدخال مستخدم editor بنجاح.');
    console.log('المعرف:', user.id);
    console.log('اسم المستخدم:', user.username);
    console.log('الدور:', user.role);
    console.log('كلمة المرور:', password);
  } catch (error) {
    console.error('خطأ في إنشاء المستخدم:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestEditor(); 