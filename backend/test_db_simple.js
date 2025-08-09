const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 اختبار قاعدة البيانات مباشرة...\n');

  try {
    // اختبار الاتصال
    console.log('1. اختبار الاتصال...');
    await prisma.$connect();
    console.log('✅ الاتصال ناجح');
    
    // اختبار BasicInfo
    console.log('\n2. اختبار BasicInfo...');
    const basicInfo = await prisma.basicInfo.findFirst({ where: { page: 'home' } });
    console.log('BasicInfo:', basicInfo ? 'موجود' : 'غير موجود');
    
    // اختبار News
    console.log('\n3. اختبار News...');
    const news = await prisma.news.findMany();
    console.log('News count:', news.length);
    
    // اختبار Reports
    console.log('\n4. اختبار Reports...');
    const reports = await prisma.report.findMany();
    console.log('Reports count:', reports.length);
    
    // اختبار Sections
    console.log('\n5. اختبار Sections...');
    const sections = await prisma.section.findMany();
    console.log('Sections count:', sections.length);
    
  } catch (error) {
    console.error('❌ خطأ في قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 