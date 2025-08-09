const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  console.log('🔍 اختبار قاعدة البيانات مباشرة...\n');

  try {
    // اختبار BasicInfo
    console.log('1. اختبار BasicInfo...');
    const basicInfo = await prisma.basicInfo.findFirst({ where: { page: 'home' } });
    console.log('BasicInfo:', basicInfo ? 'موجود' : 'غير موجود');
    
    // اختبار News
    console.log('\n2. اختبار News...');
    const news = await prisma.news.findMany();
    console.log('News count:', news.length);
    
    // اختبار Reports
    console.log('\n3. اختبار Reports...');
    const reports = await prisma.report.findMany();
    console.log('Reports count:', reports.length);
    
    // اختبار Sections
    console.log('\n4. اختبار Sections...');
    const sections = await prisma.section.findMany();
    console.log('Sections count:', sections.length);
    
    // اختبار Settings
    console.log('\n5. اختبار Settings...');
    const settings = await prisma.setting.findMany();
    console.log('Settings count:', settings.length);
    
    // اختبار ContactInfo
    console.log('\n6. اختبار ContactInfo...');
    const contactInfo = await prisma.contactInfo.findFirst();
    console.log('ContactInfo:', contactInfo ? 'موجود' : 'غير موجود');
    
  } catch (error) {
    console.error('❌ خطأ في قاعدة البيانات:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase(); 