const prisma = require('../prisma');

const ALLOWED_ROLES = ['system_admin', 'admin'];

// جلب جميع الرسائل (للمدير فقط)
async function getAllMessages(req, res) {
  try {
    // التحقق من أن المستخدم هو SYSTEM_ADMIN
    if (!ALLOWED_ROLES.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'غير مصرح لك بالوصول إلى هذه الصفحة' 
      });
    }

    const { page = 1, limit = 10, status, search, startDate, endDate } = req.query;
    const skip = (page - 1) * limit;

    // بناء شروط البحث
    const where = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    // جلب الرسائل مع العد
    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.contactMessage.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    res.json({
      messages,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الرسائل:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الرسائل' });
  }
}

// جلب رسالة واحدة
async function getMessage(req, res) {
  try {
    const { id } = req.params;

    // التحقق من أن المستخدم هو SYSTEM_ADMIN
    if (!ALLOWED_ROLES.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'غير مصرح لك بالوصول إلى هذه الصفحة' 
      });
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id },
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

    if (!message) {
      return res.status(404).json({ error: 'الرسالة غير موجودة' });
    }

    res.json(message);
  } catch (error) {
    console.error('خطأ في جلب الرسالة:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الرسالة' });
  }
}

// تحديث حالة الرسالة
async function updateMessageStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, isRead } = req.body;

    // التحقق من أن المستخدم هو SYSTEM_ADMIN
    if (!ALLOWED_ROLES.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'غير مصرح لك بالوصول إلى هذه الصفحة' 
      });
    }

    // First check if the message exists
    const existingMessage = await prisma.contactMessage.findUnique({
      where: { id }
    });

    if (!existingMessage) {
      return res.status(404).json({ error: 'الرسالة غير موجودة' });
    }

    // Prepare update data with only the fields that are provided
    const updateData = {};
    if (status !== undefined) {
      updateData.status = status;
    }
    if (isRead !== undefined) {
      updateData.isRead = isRead;
    }

    // Update the message
    const updatedMessage = await prisma.contactMessage.update({
      where: { id },
      data: updateData,
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

    res.json(updatedMessage);
  } catch (error) {
    console.error('خطأ في تحديث حالة الرسالة:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء تحديث حالة الرسالة' });
  }
}

// حذف رسالة
async function deleteMessage(req, res) {
  try {
    const { id } = req.params;

    // التحقق من أن المستخدم هو SYSTEM_ADMIN
    if (!ALLOWED_ROLES.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'غير مصرح لك بالوصول إلى هذه الصفحة' 
      });
    }

    await prisma.contactMessage.delete({
      where: { id }
    });

    res.json({ message: 'تم حذف الرسالة بنجاح' });
  } catch (error) {
    console.error('خطأ في حذف الرسالة:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء حذف الرسالة' });
  }
}

// إحصائيات الرسائل
async function getMessageStats(req, res) {
  try {
    // التحقق من أن المستخدم هو SYSTEM_ADMIN
    if (!ALLOWED_ROLES.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'غير مصرح لك بالوصول إلى هذه الصفحة' 
      });
    }

    const [total, unread, read, replied, archived] = await Promise.all([
      prisma.contactMessage.count(),
      prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
      prisma.contactMessage.count({ where: { status: 'READ' } }),
      prisma.contactMessage.count({ where: { status: 'REPLIED' } }),
      prisma.contactMessage.count({ where: { status: 'ARCHIVED' } })
    ]);

    // الرسائل في آخر 7 أيام
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentMessages = await prisma.contactMessage.count({
      where: {
        createdAt: {
          gte: lastWeek
        }
      }
    });

    res.json({
      total,
      unread,
      read,
      replied,
      archived,
      recentMessages
    });
  } catch (error) {
    console.error('خطأ في جلب إحصائيات الرسائل:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء جلب الإحصائيات' });
  }
}

// إنشاء رسالة جديدة (من نموذج الاتصال)
async function createMessage(data) {
  const { name, email, subject, message } = data;

  // التحقق من البيانات المطلوبة
  if (!name || !email || !subject || !message) {
    throw new Error('جميع الحقول مطلوبة');
  }

  // التحقق من صحة البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('البريد الإلكتروني غير صحيح');
  }

  // إنشاء الرسالة
  const newMessage = await prisma.contactMessage.create({
    data: {
      name,
      email,
      subject,
      message,
    },
  });

  return newMessage;
}

module.exports = {
  getAllMessages,
  getMessage,
  updateMessageStatus,
  deleteMessage,
  getMessageStats,
  createMessage
};
