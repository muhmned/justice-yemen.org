const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // بيانات الأدمن
  const adminUsername = 'admin';
  const adminPassword = 'admin'; // كلمة مرور بسيطة للتجربة
  const adminEmail = 'admin@sam-organization.org';

  // بيانات القسم
  const sectionName = 'قسم تجريبي';
  const sectionSlug = 'test-section';

  // أنشئ الأدمن
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      username: adminUsername,
      passwordHash,
      email: adminEmail,
      role: 'admin',
    }
  });
  console.log('✅ تم إنشاء مستخدم أدمن جديد:');
  console.log('اسم المستخدم:', adminUsername);
  console.log('كلمة المرور:', adminPassword);

  // أنشئ القسم
  const section = await prisma.section.create({
    data: {
      name: sectionName,
      slug: sectionSlug,
    }
  });
  console.log('✅ تم إنشاء قسم جديد:');
  console.log('اسم القسم:', sectionName);
  console.log('ID القسم:', section.id);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); }); 