import axios from 'axios';
import { message } from 'antd';

// Use relative URL for production (same server) or environment variable for custom backend
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 ثواني timeout
});

// إضافة التوكن لكل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('خطأ في إعداد الطلب:', error);
  return Promise.reject(error);
});

// معالجة الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('خطأ في الاستجابة:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      
      // معالجة الأخطاء المختلفة
      switch (status) {
        case 400:
          message.error(data.error || 'بيانات غير صحيحة');
          break;
        case 401:
          message.error(data.error || 'انتهت صلاحية الجلسة');
          localStorage.removeItem('admin_token');
          window.location.href = '/admin/login';
          break;
        case 403:
          message.error(data.error || 'غير مصرح لك بالوصول');
          break;
        case 404:
          message.error(data.error || 'المورد غير موجود');
          break;
        case 500:
          message.error(data.error || 'حدث خطأ في الخادم');
          break;
        default:
          message.error(data.error || 'حدث خطأ غير متوقع');
      }
    } else if (error.request) {
      // الطلب تم إرساله ولكن لم يتم استلام استجابة
      message.error('لا يمكن الاتصال بالخادم. تأكد من تشغيل الخادم');
    } else {
      // خطأ في إعداد الطلب
      message.error('حدث خطأ في إعداد الطلب');
    }
    
    return Promise.reject(error);
  }
);

// خدمات المصادقة
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  me: () => api.get('/api/admin/dashboard'),
  logout: () => api.post('/api/admin/logout'),
};

// خدمات المقالات
export const articlesAPI = {
  getAll: (params) => {
    const token = localStorage.getItem('admin_token');
    return api.get('/api/articles', { 
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getById: (id) => {
    const token = localStorage.getItem('admin_token');
    return api.get(`/api/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  create: (data) => {
    const token = localStorage.getItem('admin_token');
    return api.post('/api/articles', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  update: (id, data) => {
    const token = localStorage.getItem('admin_token');
    return api.put(`/api/articles/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  delete: (id) => {
    const token = localStorage.getItem('admin_token');
    return api.delete(`/api/articles/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  toggleStatus: (id) => {
    const token = localStorage.getItem('admin_token');
    return api.patch(`/api/articles/${id}/toggle-status`, null, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// خدمات التقارير
export const reportsAPI = {
  getAll: (params) => {
    const token = localStorage.getItem('admin_token');
    return api.get('/api/reports', { 
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getById: (id) => {
    const token = localStorage.getItem('admin_token');
    return api.get(`/api/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  create: (data) => {
    const token = localStorage.getItem('admin_token');
    // إذا كان data هو FormData، لا نضيف Content-Type
    const headers = { Authorization: `Bearer ${token}` };
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return api.post('/api/reports', data, { headers });
  },
  update: (id, data) => {
    const token = localStorage.getItem('admin_token');
    // إذا كان data هو FormData، لا نضيف Content-Type
    const headers = { Authorization: `Bearer ${token}` };
    if (!(data instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    return api.put(`/api/reports/${id}`, data, { headers });
  },
  delete: (id) => {
    const token = localStorage.getItem('admin_token');
    return api.delete(`/api/reports/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
};

// خدمات البيانات
export const statementsAPI = {
  getAll: (params) => api.get('/api/statements', { params }),
  getById: (id) => api.get(`/api/statements/${id}`),
  create: (data) => api.post('/api/statements', data),
  update: (id, data) => api.put(`/api/statements/${id}`, data),
  delete: (id) => api.delete(`/api/statements/${id}`),
};

// خدمات القصص
export const storiesAPI = {
  getAll: (params) => api.get('/api/stories', { params }),
  getById: (id) => api.get(`/api/stories/${id}`),
  create: (data) => api.post('/api/stories', data),
  update: (id, data) => api.put(`/api/stories/${id}`, data),
  delete: (id) => api.delete(`/api/stories/${id}`),
};

// خدمات الفئات
export const categoriesAPI = {
  getAll: (params) => api.get('/api/categories', { params }),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// خدمات المستخدمين
export const usersAPI = {
  getAll: (params) => api.get('/api/users', { params }),
  getById: (id) => api.get(`/api/users/${id}`),
  create: (data) => api.post('/api/users', data),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
  updateRole: (id, role) => api.patch(`/api/users/${id}/role`, { role }),
};

// خدمات الإعدادات
export const settingsAPI = {
  getAll: () => api.get('/api/settings'),
  update: (key, value) => api.put(`/api/settings/${key}`, { value }),
};

// خدمات رفع الملفات
export const uploadAPI = {
  uploadFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// خدمات الأخبار
export const newsAPI = {
  getAll: (params) => {
    const token = localStorage.getItem('admin_token');
    return api.get('/api/news', { 
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getById: (id) => {
    const token = localStorage.getItem('admin_token');
    return api.get(`/api/news/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  create: (data) => {
    const token = localStorage.getItem('admin_token');
    return api.post('/api/news', data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  update: (id, data) => {
    const token = localStorage.getItem('admin_token');
    return api.put(`/api/news/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  delete: (id) => {
    const token = localStorage.getItem('admin_token');
    return api.delete(`/api/news/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  getLatest: (limit = 3) => api.get(`/api/news?limit=${limit}&status=published`),
};

// خدمات الإحصائيات
export const statsAPI = {
  getDashboardStats: () => api.get('/api/admin/dashboard'),
  getArticleStats: () => api.get('/api/stats/articles'),
  getReportStats: () => api.get('/api/stats/reports'),
};

export default api;
