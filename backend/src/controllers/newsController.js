import prisma from '../prisma.js';
import { uploadFile } from '../utils/storageProvider.js';

const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

async function createNews(req, res) {
  try {
    const { title, summary, content, status = 'draft' } = req.body;
    const userId = req.user?.id;

    console.log('إنشاء خبر جديد');
    console.log('البيانات المرسلة:', { title, summary, content, status });
    console.log('الملفات المرفوعة:', req.files);

    // تحقق من الحقول المطلوبة
    if (!title || !summary || !content) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة (العنوان، الملخص، المحتوى)' });
    }

    // تنظيف المحتوى والتحقق من أنه ليس فارغًا
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return res.status(400).json({ error: 'محتوى الخبر لا يمكن أن يكون فارغًا' });
    }

    // تحقق من طول العنوان
    if (title.length < 5 || title.length > 100) {
      return res.status(400).json({ error: 'يجب أن يكون العنوان بين 5 و 100 حرف' });
    }

    // تحقق من طول الملخص
    if (summary.length < 10 || summary.length > 200) {
      return res.status(400).json({ error: 'يجب أن يكون الملخص بين 10 و 200 حرف' });
    }

    // تحقق من وجود المستخدم
    if (!userId) {
      return res.status(401).json({ error: 'يجب تسجيل الدخول لإضافة خبر' });
    }
    
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(401).json({ error: 'المستخدم غير موجود' });
    }

    // التحقق من الصورة (اختياري)
    let imageUrl = null;
    
    // معالجة الملفات المرفوعة (إذا كانت ملفات فعلية)
    if (req.files) {
      console.log('Processing uploaded files...');
      
      try {
        if (req.files.image && req.files.image[0]) {
          console.log('تم رفع صورة جديدة:', req.files.image[0].originalname);
          console.log('نوع الملف:', req.files.image[0].mimetype);
          console.log('حجم الملف:', req.files.image[0].size);
          
          // التحقق من نوع الملف
          if (!allowedImageTypes.includes(req.files.image[0].mimetype)) {
            console.log('نوع الملف غير مدعوم:', req.files.image[0].mimetype);
            return res.status(400).json({ 
              error: 'نوع الصورة غير مدعوم (jpg, png, webp فقط)' 
            });
          }
          
          // استخدام storageProvider لرفع الملف
          imageUrl = await uploadFile(req.files.image[0]);
          console.log('تم رفع الصورة بنجاح:', imageUrl);
        }
      } catch (uploadError) {
        console.error('خطأ في رفع الملفات:', uploadError);
        return res.status(500).json({ 
          error: 'فشل في رفع الملفات: ' + uploadError.message 
        });
      }
    } else {
      console.log('لم يتم رفع صورة');
    }

    // إنشاء الخبر
    const news = await prisma.news.create({
      data: {
        title,
        summary,
        content: trimmedContent,
        status,
        userId,
        image: imageUrl,
        publishDate: status === 'published' ? new Date() : null
      }
    });

    console.log('تم إنشاء الخبر بنجاح:', news.id);
    res.status(201).json({ message: 'تم إضافة الخبر بنجاح', news });
  } catch (err) {
    console.error('Create News Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء إضافة الخبر', details: err.message });
  }
}

async function getAllNews(req, res) {
  try {
    const { status, userId } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    const news = await prisma.news.findMany({
      where,
      include: {
        user: true
      },
      orderBy: { publishDate: 'desc' }
    });
    res.json(news);
  } catch (err) {
    console.error('Get All News Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الأخبار' });
  }
}

async function getNewsById(req, res) {
  try {
    const { id } = req.params;
    
    const news = await prisma.news.findUnique({
      where: { id },
      include: {
        user: true
      }
    });
    
    if (!news) {
      return res.status(404).json({ error: 'الخبر غير موجود' });
    }
    
    res.json(news);
  } catch (err) {
    console.error('Get News By ID Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الخبر' });
  }
}

async function updateNews(req, res) {
  try {
    const { id } = req.params;
    const { title, summary, content, status, image } = req.body;
    
    console.log('تحديث الخبر:', id);
    console.log('البيانات المرسلة:', { title, summary, content, status, image });
    console.log('الملفات المرفوعة:', req.files);
    
    // تحقق من وجود الخبر
    const existingNews = await prisma.news.findUnique({
      where: { id }
    });
    
    if (!existingNews) {
      return res.status(404).json({ error: 'الخبر غير موجود' });
    }
    
    console.log('الخبر الحالي:', existingNews);
    
    // تحقق من الحقول المطلوبة
    if (!title || !summary || !content) {
      return res.status(400).json({ error: 'جميع الحقول مطلوبة (العنوان، الملخص، المحتوى)' });
    }

    // تنظيف المحتوى والتحقق من أنه ليس فارغًا
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return res.status(400).json({ error: 'محتوى الخبر لا يمكن أن يكون فارغًا' });
    }
    
    // تحقق من طول العنوان
    if (title.length < 5 || title.length > 100) {
      return res.status(400).json({ error: 'يجب أن يكون العنوان بين 5 و 100 حرف' });
    }

    // تحقق من طول الملخص
    if (summary.length < 10 || summary.length > 200) {
      return res.status(400).json({ error: 'يجب أن يكون الملخص بين 10 و 200 حرف' });
    }
    
    // التحقق من الصورة (اختياري)
    let imageUrl = existingNews.image;
    
    // معالجة الملفات المرفوعة (إذا كانت ملفات فعلية)
    if (req.files) {
      console.log('Processing uploaded files...');
      
      try {
        if (req.files.image && req.files.image[0]) {
          console.log('تم رفع صورة جديدة:', req.files.image[0].originalname);
          console.log('نوع الملف:', req.files.image[0].mimetype);
          console.log('حجم الملف:', req.files.image[0].size);
          
          // التحقق من نوع الملف
          if (!allowedImageTypes.includes(req.files.image[0].mimetype)) {
            console.log('نوع الملف غير مدعوم:', req.files.image[0].mimetype);
            return res.status(400).json({ 
              error: 'نوع الصورة غير مدعوم (jpg, png, webp فقط)' 
            });
          }
          
          // استخدام storageProvider لرفع الملف
          imageUrl = await uploadFile(req.files.image[0]);
          console.log('تم رفع الصورة الجديدة بنجاح:', imageUrl);
        }
      } catch (uploadError) {
        console.error('خطأ في رفع الملفات:', uploadError);
        return res.status(500).json({ 
          error: 'فشل في رفع الملفات: ' + uploadError.message 
        });
      }
    } else {
      // استخدام URL من request body إذا لم يتم رفع ملف جديد
      if (image !== undefined) {
        imageUrl = image;
        console.log('استخدام URL من request body:', imageUrl);
      } else {
        console.log('لم يتم رفع صورة جديدة، الاحتفاظ بالصورة الحالية:', imageUrl);
      }
    }
    
    // تحديث الخبر
    const updatedNews = await prisma.news.update({
      where: { id },
      data: {
        title,
        summary,
        content: trimmedContent,
        status,
        image: imageUrl,
        publishDate: status === 'published' ? new Date() : existingNews.publishDate
      }
    });
    
    console.log('تم تحديث الخبر بنجاح:', updatedNews.id);
    res.json({ message: 'تم تحديث الخبر بنجاح', news: updatedNews });
  } catch (err) {
    console.error('Update News Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث الخبر' });
  }
}

async function deleteNews(req, res) {
  try {
    const { id } = req.params;
    
    // تحقق من وجود الخبر
    const news = await prisma.news.findUnique({
      where: { id }
    });
    
    if (!news) {
      return res.status(404).json({ error: 'الخبر غير موجود' });
    }
    
    // حذف الخبر
    await prisma.news.delete({
      where: { id }
    });
    
    res.json({ message: 'تم حذف الخبر بنجاح' });
  } catch (err) {
    console.error('Delete News Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الخبر' });
  }
}

async function searchNews(req, res) {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: 'مطلوب كلمة بحث' });
    }

    const searchQuery = q.trim();
    
    // البحث في الأخبار المنشورة فقط
    const news = await prisma.news.findMany({
      where: {
        AND: [
          { status: 'published' },
          {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { summary: { contains: searchQuery, mode: 'insensitive' } },
              { content: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: {
        user: {
          select: {
            name: true
          }
        }
      },
      orderBy: { publishDate: 'desc' },
      take: 10 // تحديد عدد النتائج
    });

    res.json({ 
      news: news.map(item => ({
        id: item.id,
        title: item.title,
        excerpt: item.summary,
        image: item.image,
        publishDate: item.publishDate,
        author: item.user?.name
      }))
    });
  } catch (err) {
    console.error('Search News Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء البحث في الأخبار' });
  }
}

export {
  createNews,
  getAllNews,
  getNewsById,
  updateNews,
  deleteNews,
  searchNews
};
