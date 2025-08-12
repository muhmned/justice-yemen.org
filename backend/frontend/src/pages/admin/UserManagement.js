import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Card, 
  Row, 
  Col,
  Statistic,
  Popconfirm,
  Tooltip,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    editors: 0
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const usersData = await res.json();
        setUsers(usersData);
        
        // حساب الإحصائيات
        const total = usersData.length;
        const active = usersData.filter(u => u.status === 'active').length;
        const inactive = total - active;
        const admins = usersData.filter(u => u.role === 'admin').length;
        const editors = usersData.filter(u => u.role === 'editor').length;
        
        setStats({ total, active, inactive, admins, editors });
      } else {
        message.error('تعذر جلب المستخدمين');
      }
    } catch (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      message.error('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status
    });
    setModalVisible(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        message.success('تم حذف المستخدم بنجاح');
        fetchUsers();
      } else {
        message.error('تعذر حذف المستخدم');
      }
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      message.error('تعذر الاتصال بالخادم');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        message.success(`تم ${newStatus === 'active' ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`);
        fetchUsers();
      } else {
        message.error('تعذر تحديث حالة المستخدم');
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة المستخدم:', error);
      message.error('تعذر الاتصال بالخادم');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingUser 
        ? `http://localhost:5000/api/users/${editingUser.id}`
        : 'http://localhost:5000/api/users';
      
      const method = editingUser ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (res.ok) {
        message.success(editingUser ? 'تم تحديث المستخدم بنجاح' : 'تم إضافة المستخدم بنجاح');
        setModalVisible(false);
        fetchUsers();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'تعذر حفظ المستخدم');
      }
    } catch (error) {
      console.error('خطأ في حفظ المستخدم:', error);
      message.error('تعذر الاتصال بالخادم');
    }
  };

  const columns = [
    {
      title: 'اسم المستخدم',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          {record.role === 'admin' && (
            <Badge color="red" text="مدير" />
          )}
        </div>
      ),
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'الدور',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'مدير' : 'محرر'}
        </Tag>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ الإنشاء',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="تعديل">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Tooltip title={record.status === 'active' ? 'إلغاء التفعيل' : 'تفعيل'}>
            <Button 
              type="text" 
              icon={record.status === 'active' ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleStatus(record.id, record.status)}
            />
          </Tooltip>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا المستخدم؟"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Tooltip title="حذف">
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>إدارة المستخدمين | لوحة التحكم</title>
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
            <h1 style={{ 
              margin: 0, 
              color: '#1e3c72', 
              fontWeight: 'bold',
              fontSize: '28px'
            }}>
              إدارة المستخدمين
            </h1>
            <p style={{ margin: '8px 0 0 0', color: '#666' }}>
              إدارة المستخدمين والصلاحيات
            </p>
          </div>
          <Space>
      {/*   <Button 
              icon={<ReloadOutlined />}
              onClick={fetchUsers}
            >
              تحديث
            </Button>*/}   
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAddUser}
            >
              إضافة مستخدم
            </Button>
          </Space>
        </div>

        {/* الإحصائيات */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي المستخدمين"
                value={stats.total}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3498db' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="المستخدمين النشطين"
                value={stats.active}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#27ae60' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="المديرين"
                value={stats.admins}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#e74c3c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="المحررين"
                value={stats.editors}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#f39c12' }}
              />
            </Card>
          </Col>
        </Row>

        {/* جدول المستخدمين */}
        <Card>
          <Table 
            columns={columns} 
            dataSource={users} 
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} من ${total} مستخدم`
            }}
          />
        </Card>

        {/* Modal إضافة/تعديل مستخدم */}
        <Modal
          title={editingUser ? 'تعديل المستخدم' : 'إضافة مستخدم جديد'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="username"
                  label="اسم المستخدم"
                  rules={[
                    { required: true, message: 'يرجى إدخال اسم المستخدم' },
                    { min: 3, message: 'يجب أن يكون اسم المستخدم 3 أحرف على الأقل' }
                  ]}
                >
                  <Input placeholder="أدخل اسم المستخدم" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="البريد الإلكتروني"
                  rules={[
                    { required: true, message: 'يرجى إدخال البريد الإلكتروني' },
                    { type: 'email', message: 'يرجى إدخال بريد إلكتروني صحيح' }
                  ]}
                >
                  <Input placeholder="أدخل البريد الإلكتروني" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="role"
                  label="الدور"
                  rules={[{ required: true, message: 'يرجى اختيار الدور' }]}
                >
                  <Select placeholder="اختر الدور">
                    <Option value="editor">محرر</Option>
                    <Option value="admin">مدير</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="status"
                  label="الحالة"
                  rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
                >
                  <Select placeholder="اختر الحالة">
                    <Option value="active">نشط</Option>
                    <Option value="inactive">غير نشط</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label={editingUser ? "كلمة مرور جديدة (اختياري)" : "كلمة المرور"}
                  rules={[
                    { required: !editingUser, message: 'يرجى إدخال كلمة المرور' },
                    { min: 6, message: 'يجب أن تكون كلمة المرور 6 أحرف على الأقل' }
                  ]}
                >
                  <Input.Password placeholder="أدخل كلمة المرور" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="confirmPassword"
                  label={editingUser ? "تأكيد كلمة المرور الجديدة" : "تأكيد كلمة المرور"}
                  dependencies={['password']}
                  rules={[
                    { required: !editingUser, message: 'يرجى تأكيد كلمة المرور' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!getFieldValue('password') || !value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('كلمة المرور غير متطابقة'));
                      },
                    }),
                  ]}
                >
                  <Input.Password placeholder="أعد إدخال كلمة المرور" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingUser ? 'تحديث' : 'إضافة'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  إلغاء
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default UserManagement;
