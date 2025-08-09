const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function authenticateToken(req, res, next) {
  console.log('[AUTH] Authenticating token...');
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    console.log('[AUTH] No token provided.');
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      console.log('[AUTH] Token verification failed:', err.message);
      return res.sendStatus(403);
    }

    try {
      console.log('[AUTH] Token decoded:', decoded);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, role: true },
      });

      if (!user) {
        console.log('[AUTH] User not found for decoded ID:', decoded.userId);
        return res.sendStatus(403);
      }

      console.log('[AUTH] User found:', user);
      console.log('[AUTH] User ID type:', typeof user.id);
      console.log('[AUTH] User ID value:', user.id);
      // تحويل البيانات إلى التنسيق المطلوب
      req.user = {
        id: user.id,
        username: user.username,
        role: user.role
      };
      next();
    } catch (dbError) {
      console.log('[AUTH] Database error while fetching user:', dbError);
      return res.sendStatus(500);
    }
  });
}

function requireRole(roles) {
  return (req, res, next) => {
    console.log('[MIDDLEWARE] requireRole - Start');
    console.log(`[MIDDLEWARE] requireRole - Checking user role. User:`, req.user);
    console.log(`[MIDDLEWARE] requireRole - Required roles:`, roles);

    if (!req.user || !req.user.role) {
      console.log('[MIDDLEWARE] requireRole - No user or role found on request object.');
      return res.status(403).json({ message: 'Forbidden' });
    }

    console.log(`[MIDDLEWARE] requireRole - User role is '${req.user.role}'. Checking against required roles.`);
    if (!roles.map(r => r.toLowerCase()).includes(req.user.role.toLowerCase())) {
      console.log(`[MIDDLEWARE] requireRole - Forbidden for role: ${req.user.role}`);
      return res.status(403).json({ message: 'Forbidden' });
    }

    console.log('[MIDDLEWARE] requireRole - Success, role authorized.');
    next();
  };
}

function checkPermission(permission) {
  return (req, res, next) => {
    console.log(`[MIDDLEWARE] checkPermission - Checking permission '${permission}'. User:`, req.user);

    if (req.user && req.user.role && (req.user.role.toLowerCase() === 'admin' || req.user.role.toLowerCase() === 'system_admin')) {
      console.log(`[MIDDLEWARE] checkPermission - User is admin/system_admin, access granted.`);
      return next(); // Admin and system_admin have all permissions
    }

    // دعم النظام الجديد: permission يكون مثل "add_section"
    // نقسمه إلى العملية والكيان
    let hasPermission = false;
    if (req.user && req.user.permissions && typeof permission === 'string' && permission.includes('_')) {
      const [action, entity] = permission.split('_');
      // دعم جمع الكيان (sections, articles, ...)
      let entityKey = entity;
      if (!entityKey.endsWith('s')) entityKey += 's';
      if (
        req.user.permissions[entityKey] &&
        Array.isArray(req.user.permissions[entityKey]) &&
        req.user.permissions[entityKey].includes(action)
      ) {
        hasPermission = true;
      }
    }

    console.log(`[MIDDLEWARE] checkPermission - User has permission? ${hasPermission}`);
    if (!hasPermission) {
      console.log(`[MIDDLEWARE] checkPermission - Access denied for permission: ${permission}`);
      return res.status(403).json({ message: 'Access denied' });
    }

    console.log(`[MIDDLEWARE] checkPermission - Success, permission granted.`);
    next();
  };
}

module.exports = { authenticateToken, requireRole, checkPermission };
