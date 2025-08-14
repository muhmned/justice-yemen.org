import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Typography,
  Descriptions,
  Avatar,
  Button,
  Divider,
  Space,
  Tag,
  message,
  Form,
  Input,
  Modal,
  Statistic,
  List,
  Timeline,
  Progress,
  Badge
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  MailOutlined,
  CalendarOutlined,
  IdcardOutlined,
  LockOutlined,
  FileTextOutlined,
  EyeOutlined,
  LikeOutlined,
  CommentOutlined,
  TrophyOutlined,
  FireOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EditFilled,
  DeleteFilled,
  StarFilled
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [userStats, setUserStats] = useState({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    recentActivity: [],
    newsCount: 0,
    reportsCount: 0
  });
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // تحديد ما إذا كان المستخدم مدير نظام
  const isSystemAdmin = userData.role === 'SYSTEM_ADMIN';
  
  console.log('بيانات المستخدم:', userData);
  console.log('دور المستخدم:', userData.role);
  console.log('هل مدير نظام؟', isSystemAdmin);

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (userData.id) {
      fetchUserStats();
    }
  }, [userData.id]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      // محاولة جلب بيانات المستخدم من localStorage أولاً
      const userData = localStorage.getItem('admin_user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUserData(parsedUser);
        form.setFieldsValue({
          name: parsedUser.name || parsedUser.username || '',
          email: parsedUser.email || '',
          username: parsedUser.username || '',
          bio: parsedUser.bio || ''
        });
      } else {
        // إذا لم توجد بيانات في localStorage، جلبها من الخادم
        const token = localStorage.getItem('admin_token');
        const response = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
          localStorage.setItem('admin_user', JSON.stringify(data));
          form.setFieldsValue({
            name: data.name || data.username || '',
            email: data.email || '',
            username: data.username || '',
            bio: data.bio || ''
          });
        } else {
          message.error('فشل في جلب بيانات المستخدم');
        }
      }
    } catch (error) {
      console.error('فشل في جلب بيانات المستخدم:', error);
      message.error('حدث خطأ أثناء جلب بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const userId = userData.id;
      
      console.log('userData:', userData);
      console.log('userId من userData:', userId);
      console.log('نوع userId:', typeof userId);
      
      if (!userId || !token) {
        console.log('لا يوجد userId أو token');
        return;
      }

      console.log('دور المستخدم:', userData.role);
      console.log('ID المستخدم:', userId);
      console.log('هل مدير نظام؟', isSystemAdmin);

      // استخدام API service بدلاً من fetch مباشر
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('استجابة الإحصائيات:', response.status);

      if (response.ok) {
        const stats = await response.json();
        console.log('الإحصائيات المستلمة:', stats);
        setUserStats(stats);
      } else {
        const errorData = await response.json();
        console.error('خطأ في جلب الإحصائيات:', errorData);
        message.error('لا توجد بيانات إحصائية متاحة لهذا المستخدم');
        setUserStats({
          totalArticles: 0,
          publishedArticles: 0,
          draftArticles: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          recentActivity: [],
          newsCount: 0,
          reportsCount: 0
        });
      }
    } catch (error) {
      console.error('فشل في جلب إحصائيات المستخدم:', error);
      message.error('حدث خطأ أثناء جلب بيانات الإحصائيات');
      setUserStats({
        totalArticles: 0,
        publishedArticles: 0,
        draftArticles: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        recentActivity: [],
        newsCount: 0,
        reportsCount: 0
      });
    }
  };

  const handleEditProfile = async (values) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUserData(updatedUser);
        localStorage.setItem('admin_user', JSON.stringify(updatedUser));
        message.success('تم تحديث الملف الشخصي بنجاح');
        setEditModalVisible(false);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'فشل في تحديث الملف الشخصي');
      }
    } catch (error) {
      console.error('خطأ في تحديث الملف الشخصي:', error);
      message.error('حدث خطأ أثناء تحديث الملف الشخصي');
    }
  };

  const handleChangePassword = async (values) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        message.success('تم تغيير كلمة المرور بنجاح');
        passwordForm.resetFields();
        setPasswordModalVisible(false);
      } else {
        const errorData = await response.json();
        message.error(errorData.error || 'فشل في تغيير كلمة المرور');
      }
    } catch (error) {
      console.error('خطأ في تغيير كلمة المرور:', error);
      message.error('حدث خطأ أثناء تغيير كلمة المرور');
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'red';
      case 'SYSTEM_ADMIN':
        return 'purple';
      case 'USER':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'مدير نظام';
      case 'SYSTEM_ADMIN':
        return 'مدير نظام رئيسي';
      case 'USER':
        return 'مستخدم';
      default:
        return role;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'article_created':
        return <PlusOutlined style={{ color: '#52c41a' }} />;
      case 'article_edited':
        return <EditFilled style={{ color: '#1890ff' }} />;
      case 'article_published':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'article_deleted':
        return <DeleteFilled style={{ color: '#ff4d4f' }} />;
      case 'report_created':
        return <PlusOutlined style={{ color: '#722ed1' }} />;
      case 'report_published':
        return <CheckCircleOutlined style={{ color: '#722ed1' }} />;
      default:
        return <FileTextOutlined />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'article_created':
        return 'green';
      case 'article_edited':
        return 'blue';
      case 'article_published':
        return 'green';
      case 'article_deleted':
        return 'red';
      case 'report_created':
        return 'purple';
      case 'report_published':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <div className="profile-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Helmet>
        <title>الملف الشخصي | منظمة جاستيس للحقوق والتنمية</title>
      </Helmet>

      {/* معلومات المستخدم الأساسية */}
      <Card
        loading={loading}
        className="profile-card"
        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '24px' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8} lg={6}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                style={{ 
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  marginBottom: '16px'
                }}
              />
              <Title level={3}>{userData.name || userData.username || 'مستخدم'}</Title>
              <Tag color={getRoleColor(userData.role)} size="large">
                {getRoleText(userData.role)}
              </Tag>
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary">
                  عضو منذ {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                </Text>
              </div>
            </div>
            <Divider />
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => setEditModalVisible(true)}
                block
              >
                تعديل الملف الشخصي
              </Button>
              <Button
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
                block
              >
                تغيير كلمة المرور
              </Button>
            </Space>
          </Col>

          <Col xs={24} md={16} lg={18}>
            <Title level={2}>الملف الشخصي</Title>
            <Descriptions
              bordered
              column={1}
              size="middle"
              style={{ marginTop: '16px' }}
            >
              <Descriptions.Item label="الاسم الكامل">
                {userData.name || userData.username || 'غير محدد'}
              </Descriptions.Item>
              <Descriptions.Item label="اسم المستخدم">
                {userData.username || 'غير محدد'}
              </Descriptions.Item>
              <Descriptions.Item label="البريد الإلكتروني">
                {userData.email || 'غير محدد'}
              </Descriptions.Item>
           {/*   <Descriptions.Item label="تاريخ التسجيل">
                {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
              </Descriptions.Item>
              <Descriptions.Item label="الحالة">
                <Tag color={userData.status === 'active' ? 'green' : 'red'}>
                  {userData.status === 'active' ? 'نشط' : 'غير نشط'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="نبذة شخصية">
                {userData.bio || 'لا توجد معلومات'}
              </Descriptions.Item>*/}
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* إحصائيات المستخدم */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Title level={4} style={{ marginBottom: '16px', textAlign: 'center' }}>
            إحصائيات {userData.name || userData.username || 'المستخدم'}
          </Title>
        </Col>
        {loading && (
          <Col span={24}>
            <Card>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Text>جاري تحميل الإحصائيات...</Text>
              </div>
            </Card>
          </Col>
        )}
                {!loading && (
          <>
            {userStats.totalArticles === 0 && userStats.newsCount === 0 && userStats.reportsCount === 0 ? (
              <Col span={24}>
                <Card>
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <FileTextOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                    <Title level={4} type="secondary">لا توجد إحصائيات متاحة</Title>
                    <Text type="secondary">لم يتم إضافة أي محتوى بعد</Text>
                  </div>
                </Card>
              </Col>
            ) : (
              <>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="مقالاتي"
                      value={userStats.totalArticles || 0}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="مقالاتي المنشورة"
                      value={userStats.publishedArticles || 0}
                      prefix={<CheckCircleOutlined />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="أخباري"
                      value={userStats.newsCount || 0}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#e67e22' }}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Card>
                    <Statistic
                      title="تقاريري"
                      value={userStats.reportsCount || 0}
                      prefix={<FileTextOutlined />}
                      valueStyle={{ color: '#9b59b6' }}
                    />
                  </Card>
                </Col>
              </>
            )}
          </>
        )}
      </Row>

      {/* تفاصيل الإحصائيات */}
      {!loading && userStats.totalArticles > 0 && (
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="تفاصيل مقالاتي" extra={<FileTextOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="المقالات المنشورة"
                  value={userStats.publishedArticles || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress 
                  percent={userStats.totalArticles > 0 ? (userStats.publishedArticles / userStats.totalArticles) * 100 : 0} 
                  status="active"
                  strokeColor="#52c41a"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="المقالات المسودة"
                  value={userStats.draftArticles || 0}
                  valueStyle={{ color: '#faad14' }}
                />
                <Progress 
                  percent={userStats.totalArticles > 0 ? (userStats.draftArticles / userStats.totalArticles) * 100 : 0} 
                  status="active"
                  strokeColor="#faad14"
                />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="متوسط المشاهدات"
                  value={userStats.totalArticles > 0 ? Math.round((userStats.totalViews || 0) / userStats.totalArticles) : 0}
                  prefix={<EyeOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="متوسط الإعجابات"
                  value={userStats.totalArticles > 0 ? Math.round((userStats.totalLikes || 0) / userStats.totalArticles) : 0}
                  prefix={<LikeOutlined />}
                  valueStyle={{ color: '#eb2f96' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card title="الأداء العام" extra={<TrophyOutlined />}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic
                  title="معدل النشر"
                  value={userStats.totalArticles > 0 ? Math.round(((userStats.publishedArticles || 0) / userStats.totalArticles) * 100) : 0}
                  suffix="%"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress 
                  percent={userStats.totalArticles > 0 ? ((userStats.publishedArticles || 0) / userStats.totalArticles) * 100 : 0} 
                  status="active"
                  strokeColor="#52c41a"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="معدل التفاعل"
                  value={(userStats.totalViews || 0) > 0 ? Math.round(((userStats.totalLikes || 0) / (userStats.totalViews || 1)) * 100) : 0}
                  suffix="%"
                  valueStyle={{ color: '#eb2f96' }}
                />
                <Progress 
                  percent={(userStats.totalViews || 0) > 0 ? ((userStats.totalLikes || 0) / (userStats.totalViews || 1)) * 100 : 0} 
                  status="active"
                  strokeColor="#eb2f96"
                />
              </Col>
            </Row>
            <Divider />
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <div style={{ textAlign: 'center' }}>
                  <Badge count={userStats.totalArticles || 0} showZero>
                    <Avatar size={64} icon={<FileTextOutlined />} style={{ backgroundColor: '#1890ff' }} />
                  </Badge>
                  <Text style={{ display: 'block', marginTop: '8px' }}>
                    إجمالي المقالات
                  </Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        </Row>
      )}

            {/* الأنشطة الأخيرة */}
      {!loading && (
        <Card 
          title="أنشطتي الأخيرة"
          extra={<ClockCircleOutlined />}
          style={{ marginBottom: '24px' }}
        >
          <Timeline>
            {(userStats.recentActivity || []).map((activity, index) => (
              <Timeline.Item 
                key={activity.id}
                dot={getActivityIcon(activity.type)}
                color={getActivityColor(activity.type)}
              >
                <div style={{ marginBottom: '8px' }}>
                  <Text strong>{activity.title}</Text>
                  <br />
                  <Text type="secondary">{activity.description}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
               { new Date(activity.date).toLocaleDateString('ar-SA-u-ca-gregory')}
                  </Text>


                </div>
              </Timeline.Item>
            ))}
            {(userStats.recentActivity || []).length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <ClockCircleOutlined style={{ fontSize: '48px', color: '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} type="secondary">لا توجد أنشطة حديثة</Title>
                <Text type="secondary">لم يتم إضافة أي محتوى بعد</Text>
              </div>
            )}
          </Timeline>
        </Card>
      )}

      {/* نموذج تعديل الملف الشخصي */}
      <Modal
        title="تعديل الملف الشخصي"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditProfile}
        >
          <Form.Item
            name="name"
            label="الاسم الكامل"
            rules={[{ required: true, message: 'يرجى إدخال الاسم الكامل' }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="username"
            label="اسم المستخدم"
            rules={[{ required: true, message: 'يرجى إدخال اسم المستخدم' }]}
          >
            <Input prefix={<IdcardOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="البريد الإلكتروني"
            rules={[
              { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
              { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
            ]}
          >
            <Input prefix={<MailOutlined />} />
          </Form.Item>

          <Form.Item
            name="bio"
            label="نبذة شخصية"
          >
            <TextArea rows={4} placeholder="أخبرنا عن نفسك..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                حفظ التغييرات
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* نموذج تغيير كلمة المرور */}
      <Modal
        title="تغيير كلمة المرور"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="كلمة المرور الحالية"
            rules={[{ required: true, message: 'يرجى إدخال كلمة المرور الحالية' }]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="كلمة المرور الجديدة"
            rules={[
              { required: true, message: 'يرجى إدخال كلمة المرور الجديدة' },
              { min: 6, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="تأكيد كلمة المرور الجديدة"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'يرجى تأكيد كلمة المرور الجديدة' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('كلمتا المرور غير متطابقتين'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                تغيير كلمة المرور
              </Button>
              <Button onClick={() => setPasswordModalVisible(false)}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
