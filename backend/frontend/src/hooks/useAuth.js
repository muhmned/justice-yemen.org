import { useState, useEffect, createContext, useContext } from 'react';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('admin_token'));

  const checkAuth = async () => {
    console.log('Checking auth with token:', token ? 'exists' : 'not found');
    if (token) {
     try {
  // We need a dedicated endpoint to get the current user's data
  const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const userData = await response.json();
          console.log('User data retrieved:', userData);
          setUser(userData);
        } else {
          console.log('Token validation failed, logging out');
          logout();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        logout();
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, [token]);

  const login = async (username, password) => {
    console.log('Login attempt for username:', username);
   try {
  const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', { status: response.status, data });

      if (response.ok) {
        console.log('Login successful, saving token:', data.token ? 'exists' : 'missing');
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('admin_token', data.token);

        // حفظ بيانات المستخدم أيضاً
        if (data.user) {
          localStorage.setItem('admin_user', JSON.stringify(data.user));
        }

        console.log('Token saved to localStorage:', localStorage.getItem('admin_token') ? 'success' : 'failed');
        return { success: true, message: data.message || 'تم تسجيل الدخول بنجاح', user: data.user };
      } else {
        // معالجة الأخطاء المختلفة
        let errorMessage = 'فشل في تسجيل الدخول';

        if (response.status === 400) {
          errorMessage = data.error || 'يرجى إدخال جميع البيانات المطلوبة';
        } else if (response.status === 401) {
          errorMessage = data.error || 'اسم المستخدم أو كلمة المرور غير صحيحة';
        } else if (response.status === 403) {
          errorMessage = data.error || 'حسابك غير مفعل';
        } else if (response.status === 500) {
          errorMessage = data.error || 'حدث خطأ في الخادم';
        }

        console.log('Login failed:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      console.error('خطأ في الاتصال:', error);

      // تحديد نوع الخطأ
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
          success: false,
          error: 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم'
        };
      }

      return {
        success: false,
        error: 'حدث خطأ في الاتصال بالخادم'
      };
    }
  };

  const logout = () => {
    console.log('Logging out, clearing token and user data');
    setUser(null);
    setToken(null);
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    message.info('تم تسجيل الخروج بنجاح');
  };

  const hasRole = (roles) => {
    if (!user) return false;
    const userRole = user.role.toLowerCase();
    if (Array.isArray(roles)) {
      return roles.some(role => userRole === role.toLowerCase());
    }
    return userRole === roles.toLowerCase();
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    if (user.role === 'system_admin') return true;

    if (user.permissions && typeof user.permissions === 'object') {
      const [module, action] = permission.split('_');
      if (action) {
        // Action-level permission (e.g., 'articles_add')
        return user.permissions[module]?.includes(action);
      } else {
        // Module-level permission (e.g., 'articles')
        return user.permissions[module]?.includes('view');
      }
    }
    return false;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
