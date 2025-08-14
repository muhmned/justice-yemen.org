import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Row,
  Col,
  Switch,
  Select,
  Space,
  Typography,
  Alert,
  Spin
} from 'antd';
import {
  SaveOutlined,
  ReloadOutlined,
  SettingOutlined,
  GlobalOutlined,
  MailOutlined,
  SecurityScanOutlined,
  FileTextOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';

const { Option } = Select;
const { Title, Text } = Typography;
const { TextArea } = Input;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'منظمة جستيس للحقوق والتنمية',
    siteDescription: '   ',
    contactEmail: 'nab7716@gmail.com',
    contactPhone: '737686940',
    address: 'اليمن تعز شارع جمال خلف الكريمي وسوق ديلوكس',
    facebookUrl: '',
    twitterUrl: '',
    instagramUrl: '',
    youtubeUrl: '',
    enableComments: true,
    enableRegistration: true,
    maintenanceMode: false,
    maxFileSize: 2,
    allowedFileTypes: ['jpg', 'png', 'gif', 'webp'],
    sessionTimeout: 24,
    backupFrequency: 'daily'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        return;
      }

        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        form.setFieldsValue(data);
      } else {
        // استخدام الإعدادات الافتراضية إذا فشل في جلب البيانات
        form.setFieldsValue(settings);
      }
    } catch (error) {
      console.error('خطأ في جلب الإعدادات:', error);
      message.error('تعذر جلب الإعدادات');
      form.setFieldsValue(settings);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('admin_token');

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (res.ok) {
        message.success('تم حفظ الإعدادات بنجاح');
        setSettings(values);
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'تعذر حفظ الإعدادات');
      }
    } catch (error) {
      console.error('خطأ في حفظ الإعدادات:', error);
      message.error('تعذر الاتصال بالخادم');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(settings);
    message.info('تم إعادة تعيين الإعدادات');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>جاري تحميل الإعدادات...</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>إعدادات الموقع | لوحة التحكم</title>
      </Helmet>

      <div style={{ padding: '24px' }}>
        {/* العنوان وأزرار التحكم */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1e3c72' }}>
              <SettingOutlined style={{ marginLeft: '8px' }} />
              إعدادات الموقع
            </Title>
            <Text type="secondary">
              إدارة إعدادات الموقع والتكوين
            </Text>
          </div>
          <Space>
          { /* <Button
              icon={<ReloadOutlined />}
              onClick={fetchSettings}
            >
              تحديث
            </Button>*/}
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => form.submit()}
              loading={saving}
            >
              حفظ الإعدادات
              </Button>
           { /* <button onClick={() => {
              const logs = JSON.parse(localStorage.getItem("appErrors") || "[]");
              alert(JSON.stringify(logs, null, 2));
            }}>
              عرض سجل الأخطاء
            </button>*/}
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={settings}
        >
          {/* إعدادات الموقع الأساسية */}
          <Card
            title={
              <Space>
                <GlobalOutlined />
                إعدادات الموقع الأساسية
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="siteName"
                  label="اسم الموقع"
                  rules={[{ required: true, message: 'يرجى إدخال اسم الموقع' }]}
                >
                  <Input placeholder="أدخل اسم الموقع" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="siteDescription"
                  label="وصف الموقع"
                  rules={[{ required: true, message: 'يرجى إدخال وصف الموقع' }]}
                >
                  <Input placeholder="أدخل وصف الموقع" />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* معلومات الاتصال */}
          <Card
            title={
              <Space>
                <MailOutlined />
                معلومات الاتصال
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contactEmail"
                  label="البريد الإلكتروني"
                  rules={[
                    { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                    { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                  ]}
                >
                  <Input placeholder="أدخل البريد الإلكتروني" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="contactPhone"
                  label="رقم الهاتف"
                >
                  <Input placeholder="أدخل رقم الهاتف" />
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item
                  name="address"
                  label="العنوان"
                >
                  <TextArea
                    placeholder="أدخل العنوان الكامل"
                    rows={3}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* وسائل التواصل الاجتماعي */}
          <Card
            title={
              <Space>
                <GlobalOutlined />
                وسائل التواصل الاجتماعي
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="facebookUrl"
                  label="رابط فيسبوك"
                >
                  <Input placeholder="https://facebook.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="twitterUrl"
                  label="رابط تويتر"
                >
                  <Input placeholder="https://twitter.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="instagramUrl"
                  label="رابط إنستغرام"
                >
                  <Input placeholder="https://instagram.com/..." />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="youtubeUrl"
                  label="رابط يوتيوب"
                >
                  <Input placeholder="https://youtube.com/..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* إعدادات النظام */}
          <Card
            title={
              <Space>
                <SecurityScanOutlined />
                إعدادات النظام
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="enableComments"
                  label="تفعيل التعليقات"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="enableRegistration"
                  label="تفعيل التسجيل"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="maintenanceMode"
                  label="وضع الصيانة"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="sessionTimeout"
                  label="مهلة الجلسة (ساعات)"
                >
                  <Select>
                    <Option value={1}>1 ساعة</Option>
                    <Option value={6}>6 ساعات</Option>
                    <Option value={12}>12 ساعة</Option>
                    <Option value={24}>24 ساعة</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* إعدادات الملفات */}
          <Card
            title={
              <Space>
                <FileTextOutlined />
                إعدادات الملفات
              </Space>
            }
            style={{ marginBottom: '24px' }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="maxFileSize"
                  label="الحد الأقصى لحجم الملف (ميجابايت)"
                >
                  <Select>
                    <Option value={1}>1 ميجابايت</Option>
                    <Option value={2}>2 ميجابايت</Option>
                    <Option value={5}>5 ميجابايت</Option>
                    <Option value={10}>10 ميجابايت</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="backupFrequency"
                  label="تكرار النسخ الاحتياطي"
                >
                  <Select>
                    <Option value="daily">يومي</Option>
                    <Option value="weekly">أسبوعي</Option>
                    <Option value="monthly">شهري</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* إعدادات المستخدمين */}
          <Card
            title={
              <Space>
                <UserOutlined />
                إعدادات المستخدمين
              </Space>
            }
          >
            <Alert
              message="إعدادات المستخدمين"
              description="يمكنك إدارة إعدادات المستخدمين والصلاحيات من صفحة إدارة المستخدمين"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="defaultUserRole"
                  label="الدور الافتراضي للمستخدمين الجدد"
                >
                  <Select>
                    <Option value="editor">محرر</Option>
                    <Option value="contributor">مساهم</Option>
                    <Option value="viewer">مشاهد</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="requireEmailVerification"
                  label="تطلب تأكيد البريد الإلكتروني"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          {/* أزرار التحكم */}
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
                loading={saving}
              >
                حفظ الإعدادات
              </Button>
              <Button
                size="large"
                onClick={handleReset}
              >
                إعادة تعيين
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </>
  );
};

export default Settings; 