import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet';
import { useAuth } from '../../hooks/useAuth';
import { Table, Select, message, Tag, Spin, Alert, Modal, Checkbox, Row, Col, Button, Divider } from 'antd';

const { Option } = Select;

const roleColors = {
  system_admin: 'volcano',
  admin: 'geekblue',
  editor: 'green',
};



const PermissionsPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissions, setPermissions] = useState({});
  const { user, token } = useAuth();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في جلب المستخدمين');
      }
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role === 'system_admin') {
      fetchUsers();
    }
  }, [user, fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'فشل في تحديث الصلاحية');
      }
      
      message.success('تم تحديث الصلاحية بنجاح');
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );

    } catch (err) {
      message.error(`خطأ: ${err.message}`);
    }
  };

  const columns = [
    {
      title: 'اسم المستخدم',
      dataIndex: 'username',
      key: 'username',
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'البريد الإلكتروني',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'الصلاحية',
      dataIndex: 'role',
      key: 'role',
      render: (role, record) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          disabled={record.id === user.id}
          style={{ width: 120 }}
        >
          <Option value="editor">محرر</Option>
          <Option value="admin">مدير</Option>
          <Option value="system_admin">مدير نظام</Option>
        </Select>
      ),
      filters: [
        { text: 'مدير نظام', value: 'system_admin' },
        { text: 'مدير', value: 'admin' },
        { text: 'محرر', value: 'editor' },
      ],
      onFilter: (value, record) => record.role.indexOf(value) === 0,
    },
    {
      title: 'الدور الحالي',
      dataIndex: 'role',
      key: 'current_role',
      render: (role) => (
        <Tag color={roleColors[role] || 'default'}>
          {role === 'system_admin' ? 'مدير نظام' : role === 'admin' ? 'مدير' : 'محرر'}
        </Tag>
      ),
    },
{
  title: 'الحالة',
  dataIndex: 'status',
  key: 'status',
  render: (status) => (
    status === 'active' ? 'نشط' : 'غير نشط'
  ),
  filters: [
    { text: 'نشط', value: 'active' },
    { text: 'غير نشط', value: 'inactive' },
  ],
  onFilter: (value, record) => record.status === value,
},
    {
      title: 'الصلاحيات',
      key: 'permissions',
      render: (_, record) => (
        <Button onClick={() => showModal(record)}>
          تعديل الصلاحيات
        </Button>
      ),
    },
  ];

  const showModal = (user) => {
    setSelectedUser(user);
    // Ensure permissions are an object, default to empty if null/not an object
    const userPermissions = user.permissions && typeof user.permissions === 'object' && !Array.isArray(user.permissions)
      ? user.permissions
      : {};
    setPermissions(userPermissions);
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${selectedUser.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ permissions }),
      });

      if (!res.ok) {
        let errorData = {};
        try {
          errorData = await res.json();
        } catch (error) {
          console.error('Failed to parse error response:', error);
        }
        throw new Error(errorData.error || 'فشل في تحديث الصلاحيات');
      }
      
      message.success('تم تحديث الصلاحيات بنجاح');
      setUsers(prevUsers =>
        prevUsers.map(u => (u.id === selectedUser.id ? { ...u, permissions } : u))
      );
      setIsModalVisible(false);

    } catch (err) {
      message.error(`خطأ: ${err.message}`);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const onPermissionChange = (module, actions) => {
    setPermissions(prev => ({
      ...prev,
      [module]: actions,
    }));
  };

  const availablePermissions = {
    articles: ['view', 'add', 'edit', 'delete'],
    news: ['view', 'add', 'edit', 'delete'],
    reports: ['view', 'add', 'edit', 'delete'],
    users: ['view', 'add', 'edit', 'delete'],
    sections: ['view', 'add', 'edit', 'delete'],
    settings: ['view', 'edit'],
  };

  const permissionLabels = {
    view: 'عرض',
    add: 'إضافة',
    edit: 'تعديل',
    delete: 'حذف',
    articles: 'المقالات',
    news: 'الأخبار',
    reports: 'التقارير',
    users: 'المستخدمين',
    sections: 'الأقسام',
    settings: 'الإعدادات',
  };


const handleStatusChange = async (userId, newStatus) => {
  try {
    console.log("🔍 إرسال الحالة:", newStatus);
    const res = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive: newStatus === 'active' }), // Boolean
    });

    const data = await res.json();
    console.log("📩 رد السيرفر:", res.status, data);

    if (!res.ok) throw new Error(data.message || 'فشل في التحديث');

    message.success('تم تحديث الحالة بنجاح');
    fetchUsers();
  } catch (error) {
    console.error("❌ خطأ:", error);
    message.error('حدث خطأ أثناء تحديث الحالة');
  }
};

  if (user?.role !== 'system_admin') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <Alert
          message="غير مصرح لك بالوصول"
          description="هذه الصفحة متاحة فقط لمديري النظام."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>إدارة الصلاحيات | لوحة التحكم</title>
      </Helmet>
      <div style={{ padding: '2rem' }}>
        <h1>إدارة صلاحيات المستخدمين</h1>
        {error && <Alert message="خطأ" description={error} type="error" showIcon style={{ marginBottom: '1rem' }} />}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            bordered
            pagination={{ pageSize: 10 }}
            style={{ marginTop: '2rem' }}
          />
        </Spin>
        <Modal 
          title={`تعديل صلاحيات ${selectedUser?.username}`} 
          visible={isModalVisible} 
          onOk={handleOk} 
          onCancel={handleCancel}
          width={600}
          okText="حفظ"
          cancelText="إلغاء"
        >
          {Object.entries(availablePermissions).map(([module, actions]) => (
            <div key={module} style={{ marginBottom: 16 }}>
              <Divider orientation="right">{permissionLabels[module]}</Divider>
              <Checkbox.Group 
                style={{ width: '100%' }} 
                value={permissions[module] || []}
                onChange={(checkedValues) => onPermissionChange(module, checkedValues)}
              >
                <Row>
                  {actions.map(action => (
                    <Col span={6} key={action}>
                      <Checkbox value={action}>{permissionLabels[action]}</Checkbox>
                    </Col>
                  ))}
                </Row>
              </Checkbox.Group>
            </div>
          ))}
        </Modal>
      </div>
    </>
  );
};

export default PermissionsPage;
