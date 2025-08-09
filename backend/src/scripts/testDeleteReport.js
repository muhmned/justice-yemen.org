const { PrismaClient } = require('../../generated/prisma/client');
const prisma = new PrismaClient();

async function testDeleteReport(reportId) {
  // تحقق هل التقرير موجود قبل الحذف
  const before = await prisma.report.findUnique({ where: { id: reportId } });
  if (!before) {
    console.log('❌ التقرير غير موجود في قاعدة البيانات قبل الحذف');
    return;
  }
  console.log('✅ التقرير موجود قبل الحذف:', before);

  // نفذ الحذف
  await prisma.report.delete({ where: { id: reportId } });
  console.log('🗑️ تم تنفيذ عملية الحذف');

  // تحقق بعد الحذف
  const after = await prisma.report.findUnique({ where: { id: reportId } });
  if (!after) {
    console.log('✅ تم حذف التقرير بنجاح من قاعدة البيانات');
  } else {
    console.log('❌ التقرير ما زال موجودًا بعد محاولة الحذف:', after);
  }
}

// ضع هنا الـ id الذي تريد اختباره
const reportId = 'ضع_هنا_معرف_التقرير';

testDeleteReport(reportId)
  .catch((err) => {
    console.error('حدث خطأ أثناء الاختبار:', err);
  })
  .finally(() => {
    prisma.$disconnect();
  }); 