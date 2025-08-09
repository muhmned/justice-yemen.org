const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const username = 'admin';
  const password = 'admin';
  const email = 'admin@admin.com';
  const role = 'admin';

  // تحقق إذا كان المستخدم موجود مسبقًا
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log('المستخدم admin موجود بالفعل.');
    return;
  }

  // تشفير كلمة المرور
  const passwordHash = await bcrypt.hash(password, 10);

  // إدخال المستخدم
  await prisma.user.create({
    data: {
      username,
      passwordHash,
      email,
      role,
    },
  });
  console.log('✅ تم إدخال مستخدم admin بنجاح.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 