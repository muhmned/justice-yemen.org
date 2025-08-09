const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const about = await prisma.basicInfo.upsert({
    where: { page: 'about' },
    update: {
      title: 'من نحن',
      content: 'هذه منظمة تجريبية لحقوق الإنسان.',
      image: '',
      vision: 'رؤيتنا هي الريادة في الدفاع عن حقوق الإنسان.',
      mission: 'رسالتنا هي توثيق الانتهاكات ونشر الوعي.',
      strategic_goals: 'تحقيق العدالة، دعم الضحايا، بناء مجتمع واعٍ.',
      values: 'النزاهة، الشفافية، المصداقية.',
      org_structure: 'يتكون من مجلس إدارة وفريق عمل متخصص.',
      work_fields: 'التعليم، الصحة، التوثيق، المناصرة.'
    },
    create: {
      page: 'about',
      title: 'من نحن',
      content: 'هذه منظمة تجريبية لحقوق الإنسان.',
      image: '',
      vision: 'رؤيتنا هي الريادة في الدفاع عن حقوق الإنسان.',
      mission: 'رسالتنا هي توثيق الانتهاكات ونشر الوعي.',
      strategic_goals: 'تحقيق العدالة، دعم الضحايا، بناء مجتمع واعٍ.',
      values: 'النزاهة، الشفافية، المصداقية.',
      org_structure: 'يتكون من مجلس إدارة وفريق عمل متخصص.',
      work_fields: 'التعليم، الصحة، التوثيق، المناصرة.'
    }
  });
  console.log('تم إدخال سجل من نحن بنجاح:', about);
  await prisma.$disconnect();
}

main(); 