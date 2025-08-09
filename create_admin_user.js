const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const username = 'admin';
    const password = 'admin123456';
    const email = 'admin@admin.com';
    const role = 'admin';

    // تحقق إذا كان المستخدم موجود مسبقًا
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      console.log('المستخدم admin موجود بالفعل.');
      console.log('حاول تسجيل الدخول بكلمة المرور: admin123456');
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
    
    console.log('✅ تم إدخال مستخدم admin بنجاح.');
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

createAdminUser(); 