const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'لم يتم توفير رمز المصادقة' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('decoded:', decoded);
    
    const user = await prisma.user.findUnique({ 
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        status: true,
        createdAt: true
      }
    });
    
    if (!user) {
      return res.status(401).json({ 
        error: 'المستخدم غير موجود' 
      });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ 
        error: 'حسابك غير مفعل. يرجى التواصل مع المدير' 
      });
    }

    req.user = user;
    console.log('req.user:', req.user);
    next();
  } catch (err) {
    console.error('خطأ في المصادقة:', err);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى' 
      });
    }
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'رمز المصادقة غير صحيح' 
      });
    }
    
    return res.status(403).json({ 
      error: 'غير مصرح لك بالوصول' 
    });
  }
}; 