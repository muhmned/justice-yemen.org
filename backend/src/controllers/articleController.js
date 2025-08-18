import prisma from '../prisma.js';
import { uploadFile } from '../utils/storageProvider.js';

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

async function createArticle(req, res) {
  try {
    const { title, content, sectionId } = req.body;
    const userId = req.user?.id; // يجب أن يكون لديك ميدلوير مصادقة يضيف user إلى req

    console.log('إنشاء مقال جديد');
    console.log('البيانات المرسلة:', { title, content, sectionId });
    console.log('الملف المرفوع:', req.file);

    // تحقق من الحقول المطلوبة
    if (!title || !content || !sectionId) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة (العنوان، المحتوى، القسم)' });
    }

    // تنظيف المحتوى والتحقق من أنه ليس فارغًا
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return res.status(400).json({ error: 'محتوى المقال لا يمكن أن يكون فارغًا' });
    }

    // تحقق من طول العنوان
    if (title.length < 5 || title.length > 100) {
      return res.status(400).json({ error: 'يجب أن يكون العنوان بين 5 و 100 حرف' });
    }

    // تحقق من وجود القسم
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      return res.status(400).json({ error: 'القسم غير موجود' });
    }

    // تحقق من وجود المستخدم
    if (!userId) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول لإضافة مقال' });
  }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    // التحقق من الصورة (اختياري)
    let imageUrl = null;
    if (req.file) {
      console.log('تم رفع صورة جديدة:', req.file.originalname);
      console.log('نوع الملف:', req.file.mimetype);
      console.log('حجم الملف:', req.file.size);
      
      // التحقق من نوع الملف
      if (!allowedImageTypes.includes(req.file.mimetype)) {
        console.log('نوع الملف غير مدعوم:', req.file.mimetype);
        return res.status(400).json({ 
          error: 'نوع الصورة غير مدعوم (jpg, png, webp فقط)' 
        });
      }
      
      try {
        // استخدام storageProvider لرفع الملف
        imageUrl = await uploadFile(req.file);
        console.log('تم رفع الصورة بنجاح:', imageUrl);
      } catch (uploadError) {
        console.error('خطأ في رفع الصورة:', uploadError);
        return res.status(500).json({ 
          error: 'فشل في رفع الصورة: ' + uploadError.message 
        });
      }
    } else {
      console.log('لم يتم رفع صورة');
    }

    // إنشاء ID فريد للمقال
    const articleId = `article_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // إنشاء المقال
    const article = await prisma.article.create({
      data: {
        id: articleId,
        title,
        content: trimmedContent,
        sectionId,
        userId,
        image: imageUrl,
        // createdAt يتم توليده تلقائيًا
      }
    });

    console.log('تم إنشاء المقال بنجاح:', article.id);
    res.status(201).json({ message: 'تم إضافة المقال بنجاح', article });
  } catch (err) {
    console.error('Create Article Error:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'يوجد مقال بنفس العنوان' });
    } else if (err.code === 'P2003') {
      res.status(400).json({ error: 'القسم غير موجود' });
    } else {
      res.status(500).json({ error: 'حدث خطأ أثناء إضافة المقال', details: err.message });
    }
  }
}

async function getAllArticles(req, res) {
  try {
    const { sectionId, userId } = req.query;
    const where = {};

    if (sectionId) {
      where.sectionId = sectionId;
    }

    if (userId) {
      where.userId = userId;
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        Section: true,
        User: true,
        Category: true
      },
      orderBy: { publishDate: 'desc' }
    });
    res.json(articles);
  } catch (err) {
    console.error('Get All Articles Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المقالات' });
  }
}

async function deleteArticle(req, res) {
  try {
    const { id } = req.params;
    
    // تحقق من وجود المقال
    const article = await prisma.article.findUnique({
      where: { id }
    });
    
    if (!article) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    
    // حذف المقال
    await prisma.article.delete({
      where: { id }
    });
    
    res.json({ message: 'تم حذف المقال بنجاح' });
  } catch (err) {
    console.error('Delete Article Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف المقال' });
  }
}

async function updateArticle(req, res) {
  try {
    const { id } = req.params;
    const { title, content, sectionId } = req.body;
    
    console.log('تحديث المقال:', id);
    console.log('البيانات المرسلة:', { title, content, sectionId });
    console.log('الملف المرفوع:', req.file);
    
    // تحقق من وجود المقال
    const existingArticle = await prisma.article.findUnique({
      where: { id }
    });
    
    if (!existingArticle) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    
    console.log('المقال الحالي:', existingArticle);
    
    // تحقق من الحقول المطلوبة
    if (!title || !content || !sectionId) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة (العنوان، المحتوى، القسم)' });
    }
    
    // تنظيف المحتوى والتحقق من أنه ليس فارغًا
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return res.status(400).json({ error: 'محتوى المقال لا يمكن أن يكون فارغًا' });
    }
    
    // تحقق من طول العنوان
    if (title.length < 5 || title.length > 100) {
      return res.status(400).json({ error: 'يجب أن يكون العنوان بين 5 و 100 حرف' });
    }
    
    // تحقق من وجود القسم
    const section = await prisma.section.findUnique({ where: { id: sectionId } });
    if (!section) {
      return res.status(400).json({ error: 'القسم غير موجود' });
    }
    
    // التحقق من الصورة (اختياري)
    let imageUrl = existingArticle.image;
    if (req.file) {
      console.log('تم رفع صورة جديدة:', req.file.originalname);
      console.log('نوع الملف:', req.file.mimetype);
      console.log('حجم الملف:', req.file.size);
      
      // التحقق من نوع الملف
      if (!allowedImageTypes.includes(req.file.mimetype)) {
        console.log('نوع الملف غير مدعوم:', req.file.mimetype);
        return res.status(400).json({ 
          error: 'نوع الصورة غير مدعوم (jpg, png, webp فقط)' 
        });
      }
      
      try {
        // استخدام storageProvider لرفع الملف
        imageUrl = await uploadFile(req.file);
        console.log('تم رفع الصورة الجديدة بنجاح:', imageUrl);
      } catch (uploadError) {
        console.error('خطأ في رفع الصورة:', uploadError);
        return res.status(500).json({ 
          error: 'فشل في رفع الصورة: ' + uploadError.message 
        });
      }
    } else {
      console.log('لم يتم رفع صورة جديدة، الاحتفاظ بالصورة الحالية:', imageUrl);
    }
    
    // تحديث المقال
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: {
        title,
        content: trimmedContent,
        sectionId,
        image: imageUrl,
        publishDate: new Date()
      },
      include: {
        Section: true,
        User: true,
        Category: true
      }
    });
    
    console.log('تم تحديث المقال بنجاح:', updatedArticle.id);
    res.json({ message: 'تم تحديث المقال بنجاح', article: updatedArticle });
  } catch (err) {
    console.error('Update Article Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث المقال' });
  }
}

async function getArticleById(req, res) {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        Section: true,
        User: true,
        Category: true
      }
    });
    
    if (!article) {
      return res.status(404).json({ error: 'المقال غير موجود' });
    }
    
    res.json(article);
  } catch (err) {
    console.error('Get Article Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب المقال' });
  }
}

export { createArticle, getAllArticles, deleteArticle, updateArticle, getArticleById };
