import prisma from '../prisma.js';
import { validationResult } from 'express-validator';

// GET /api/reports
async function getAllReports(req, res) {
  try {
    const { status, userId, startDate, endDate } = req.query;
    const where = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const reports = await prisma.report.findMany({ 
      where,
      orderBy: { 
        createdAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });
    res.json(reports);
  } catch (err) {
    console.error('Get All Reports Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التقارير' });
  }
}

// POST /api/reports
async function createReport(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { title, summary, content, publishDate, status, pdfUrl, thumbnail } = req.body;
  
  console.log('Create Report Request:', { title, summary, content, publishDate, status, pdfUrl, thumbnail });
  console.log('Files uploaded:', req.files);
  console.log('Request body:', req.body);
  console.log('User ID from request:', req.user?.id);
  
  // معالجة الملفات المرفوعة (إذا كانت ملفات فعلية)
  let finalPdfUrl = pdfUrl;
  let finalThumbnail = thumbnail;
  
  if (req.files) {
    console.log('Processing uploaded files...');
    if (req.files.pdfFile && req.files.pdfFile[0]) {
      finalPdfUrl = `/uploads/${req.files.pdfFile[0].filename}`;
      console.log('PDF file uploaded:', finalPdfUrl);
    }
    
    if (req.files.thumbnail && req.files.thumbnail[0]) {
      finalThumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
      console.log('Thumbnail uploaded:', finalThumbnail);
    }
  } else {
    console.log('No files uploaded, using URLs from request body');
  }
  
  // التحقق من وجود ملف PDF (اختياري للتجربة)
  if (!finalPdfUrl) {
    console.log('تحذير: لم يتم رفع ملف PDF');
    // يمكن إزالة هذا التحقق لجعل PDF اختياري
    // return res.status(400).json({ error: 'ملف PDF مطلوب' });
  }
  
  try {
    const reportData = { 
      title, 
      summary, 
      content, 
      thumbnail: finalThumbnail, 
      publishDate: publishDate ? new Date(publishDate) : new Date(),
      status: status || 'draft',
      userId: req.user.id // إضافة userId من المستخدم المسجل الدخول
    };
    
    // إضافة pdfUrl فقط إذا كان موجوداً
    if (finalPdfUrl) {
      reportData.pdfUrl = finalPdfUrl;
    }
    
    console.log('Report data to be created:', reportData);
    
    const report = await prisma.report.create({ 
      data: reportData
    });
    console.log('Report created successfully:', report);
    res.status(201).json({ 
      message: 'تم إضافة التقرير بنجاح',
      report 
    });
  } catch (err) {
    console.error('Create Report Error:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'يوجد تقرير بنفس العنوان' });
    } else {
      res.status(400).json({ error: 'بيانات غير صحيحة', details: err.message });
    }
  }
}

// PUT /api/reports/:id
async function updateReport(req, res) {
  const { id } = req.params;
  const { title, summary, content, publishDate, status, pdfUrl, thumbnail } = req.body;
  
  console.log('Update Report Request:', { id, title, summary, content, publishDate, status, pdfUrl, thumbnail });
  console.log('Files uploaded:', req.files);
  
  try {
    // تحقق من وجود التقرير
    const existingReport = await prisma.report.findUnique({ where: { id } });
    if (!existingReport) {
      console.log('Report not found:', id);
      return res.status(404).json({ error: 'التقرير غير موجود' });
    }
    
    // تحضير بيانات التحديث
    const updateData = {};
    if (title) updateData.title = title;
    if (summary !== undefined) updateData.summary = summary;
    if (content) updateData.content = content;
    if (publishDate !== undefined) updateData.publishDate = new Date(publishDate);
    if (status) updateData.status = status;
    
    // معالجة الملفات المرفوعة (إذا كانت ملفات فعلية)
    if (req.files) {
      if (req.files.pdfFile && req.files.pdfFile[0]) {
        updateData.pdfUrl = `/uploads/${req.files.pdfFile[0].filename}`;
        console.log('New PDF file uploaded:', updateData.pdfUrl);
      }
      
      if (req.files.thumbnail && req.files.thumbnail[0]) {
        updateData.thumbnail = `/uploads/${req.files.thumbnail[0].filename}`;
        console.log('New thumbnail uploaded:', updateData.thumbnail);
      }
    } else {
      // استخدام URLs من request body
      if (pdfUrl !== undefined) updateData.pdfUrl = pdfUrl;
      if (thumbnail !== undefined) updateData.thumbnail = thumbnail;
      console.log('Using URLs from request body:', { pdfUrl, thumbnail });
    }
    
    console.log('Update data:', updateData);
    
    // تحديث التقرير
    const updatedReport = await prisma.report.update({
      where: { id },
      data: updateData
    });
    
    console.log('Report updated successfully:', updatedReport);
    res.json({ message: 'تم تحديث التقرير بنجاح', report: updatedReport });
  } catch (err) {
    console.error('Update Report Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث التقرير', details: err.message });
  }
}

// DELETE /api/reports/:id
async function deleteReport(req, res) {
  console.log('[CONTROLLER] deleteReport - Called with id:', req.params.id);
  const { id } = req.params;
  console.log('طلب حذف تقرير: id =', id);
  try {
    const existingReport = await prisma.report.findUnique({ where: { id } });
    console.log('نتيجة البحث عن التقرير قبل الحذف:', existingReport);
    if (!existingReport) {
      console.log('التقرير غير موجود في قاعدة البيانات');
      return res.status(404).json({ error: 'التقرير غير موجود' });
    }
    await prisma.report.delete({ where: { id } });
    console.log('تم حذف التقرير بنجاح من قاعدة البيانات');
    res.json({ message: 'تم حذف التقرير بنجاح' });
  } catch (err) {
    console.error('حدث خطأ أثناء حذف التقرير:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف التقرير' });
  }
}

// GET /api/reports/:id
async function getReportById(req, res) {
  const { id } = req.params;
  try {
    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ error: 'التقرير غير موجود' });
    }
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: 'حدث خطأ أثناء جلب التقرير' });
  }
}

// GET /api/reports/search
async function searchReports(req, res) {
  const { q } = req.query;
  
  if (!q || q.trim() === '') {
    return res.status(400).json({ error: 'يرجى إدخال كلمة البحث' });
  }

  try {
    const reports = await prisma.report.findMany({
      where: {
        OR: [
          {
            title: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            summary: {
              contains: q,
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: q,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        publishDate: 'desc'
      }
    });

    res.json(reports);
  } catch (err) {
    console.error('Search Reports Error:', err);
    res.status(500).json({ error: 'حدث خطأ أثناء البحث في التقارير' });
  }
}

export { getAllReports, createReport, updateReport, deleteReport, getReportById, searchReports };
