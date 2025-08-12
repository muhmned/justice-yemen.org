import prisma from '../prisma.js';

// جلب بيانات الصفحة (home أو about)
async function getBasicInfo(req, res) {
  const { page } = req.params;
  try {
    console.log(`جلب بيانات الصفحة: ${page}`);
    const info = await prisma.basicInfo.findFirst({ where: { page } });
    if (!info) {
      console.log(`لا توجد بيانات للصفحة: ${page}`);
      return res.json({});
    }
    console.log(`تم جلب بيانات الصفحة ${page} بنجاح`);
    res.json(info);
  } catch (err) {
    console.error(`خطأ في جلب بيانات الصفحة ${page}:`, err);
    res.status(500).json({ error: 'خطأ في جلب البيانات من قاعدة البيانات' });
  }
}

// تحديث بيانات الصفحة (home أو about)
async function updateBasicInfo(req, res) {
  const { page } = req.params;
  const { title, content, image, vision, mission, strategic_goals, values, org_structure, work_fields } = req.body;
  const clean = v => (v === '' ? null : v);
  
  try {
    console.log(`تحديث بيانات الصفحة: ${page}`);
    console.log('البيانات المرسلة:', { title, content, image, vision, mission, strategic_goals, values, org_structure, work_fields });
    
    const updated = await prisma.basicInfo.upsert({
      where: { page },
      update: {
        title: clean(title),
        content: clean(content),
        image: clean(image),
        vision: clean(vision),
        mission: clean(mission),
        strategic_goals: clean(strategic_goals),
        values: clean(values),
        org_structure: clean(org_structure),
        work_fields: clean(work_fields)
      },
      create: {
        page,
        title: clean(title),
        content: clean(content),
        image: clean(image),
        vision: clean(vision),
        mission: clean(mission),
        strategic_goals: clean(strategic_goals),
        values: clean(values),
        org_structure: clean(org_structure),
        work_fields: clean(work_fields)
      }
    });
    // تسجيل العملية
    if (req.user && req.user.id) {
      await prisma.activityLog.create({
        data: {
          userId: req.user.id,
          action: 'update_basic_info',
          details: `Updated basic info page: ${page}`
        }
      });
    }
    
    console.log(`تم تحديث بيانات الصفحة ${page} بنجاح:`, updated);
    res.json({
      ...updated,
      message: `تم حفظ بيانات صفحة ${page === 'home' ? 'الرئيسية' : 'من نحن'} بنجاح`
    });
  } catch (err) {
    console.error(`خطأ في تحديث بيانات الصفحة ${page}:`, err);
    res.status(500).json({ 
      error: 'خطأ في حفظ البيانات في قاعدة البيانات',
      details: err.message,
      stack: err.stack
    });
  }
}

export { getBasicInfo, updateBasicInfo }; 