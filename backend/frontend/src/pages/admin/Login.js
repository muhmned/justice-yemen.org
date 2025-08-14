import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Checkbox } from 'antd';
import { LockOutlined, UserOutlined, EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';        
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { logOperation } from '../../utils/logError';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const lastLoginDebug = useRef({});

  // التحقق من وجود token عند تحميل الصفحة
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetch(`${process.env.REACT_APP_API_URL || ''}/api/admin/dashboard`, {
       headers: { 'Authorization': `Bearer ${token}` }
           })
        .then(res => {
          if (res.ok) {
            navigate('/admin/dashboard');
          } else {
            localStorage.removeItem('admin_token');
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_token');
        });
    }
  }, [navigate]);

  // تحديث دالة تسجيل الدخول لاستخدام useAuth
  const handleLogin = async (values) => {
    setLoading(true);
    setError('');
    lastLoginDebug.current = { request: values };
    console.log('Login request body:', values);
    
    try {
      const result = await login(values.username, values.password);
      lastLoginDebug.current.response = result;
      console.log('Login result:', result);
      
      if (result.success) {
        logOperation("Login", "success", "تم تسجيل الدخول بنجاح", { user: result.user });
        setError('');
        navigate('/admin/dashboard');
      } else {
        logOperation("Login", "error", result.error || "Login failed", { error: result.error });
        setError(result.error || 'فشل تسجيل الدخول');
      }
    } catch (e) {
      lastLoginDebug.current.error = e.message;
      console.error('Login error:', e);
      setError('حدث خطأ أثناء تسجيل الدخول: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('فشل في إرسال النموذج:', errorInfo);
  };

  // استرجاع اسم المستخدم المحفوظ
  const rememberedUsername = localStorage.getItem('remembered_username');

  const debugLoginDetails = () => {
    alert(
      'آخر محاولة تسجيل دخول:\n' +
      JSON.stringify(lastLoginDebug.current, null, 2)
    );
    console.log('تفاصيل آخر محاولة تسجيل دخول:', lastLoginDebug.current);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          borderRadius: '12px'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ color: '#1890ff', marginBottom: '8px' }}>
            تسجيل الدخول
          </Title>
          <Text type="secondary">
            أدخل بيانات الدخول الخاصة بك
          </Text>
        </div>

        {error && (
          <Alert
            message="خطأ في تسجيل الدخول"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form
          name="login"
          onFinish={handleLogin}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            label="اسم المستخدم"
            rules={[
              { required: true, message: 'يرجى إدخال اسم المستخدم!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="اسم المستخدم"
              size="large"
              defaultValue={rememberedUsername}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="كلمة المرور"
            rules={[
              { required: true, message: 'يرجى إدخال كلمة المرور!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="كلمة المرور"
              size="large"
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              style={{ width: '100%', height: '45px' }}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>
          </Form.Item>
        </Form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            في حالة نسيان كلمة المرور، يرجى التواصل مع المدير
          </Text>
        </div>

        {/* معلومات إضافية للمطورين */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Button 
              type="link" 
              size="small" 
              onClick={debugLoginDetails}
              style={{ fontSize: '10px' }}
            >
              تفاصيل التصحيح
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Login; 