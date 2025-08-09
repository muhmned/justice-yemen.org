import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Space,
  Button,
  DatePicker,
  Select,
  Input,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  message,
  Tooltip,
  Badge
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  UserOutlined,
  FileTextOutlined,
  EditOutlined,
  DeleteOutlined,
  LoginOutlined,
  LogoutOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

const ActivityLog = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: null,
    actionType: 'all',
    userType: 'all',
    searchText: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch('http://localhost:5000/api/admin/activity-log', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
        setStats(data.stats || {
          total: data.activities?.length || 0,
          today: 0,
          thisWeek: 0,
          thisMonth: 0
        });
      }
    } catch (error) {
      console.error('خطأ في جلب سجل النشاطات:', error);
      message.error('تعذر جلب سجل النشاطات');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'login':
      case 'logout':
        return <LoginOutlined />;
      case 'create_article':
      case 'edit_article':
      case 'delete_article':
        return <FileTextOutlined />;
      case 'create_user':
      case 'edit_user':
      case 'delete_user':
        return <UserOutlined />;
      default:
        return <EyeOutlined />;
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType) {
      case 'auth':
        return 'blue';
      case 'content':
        return 'green';
      case 'admin':
        return 'red';
      case 'system':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    return status === 'success' ? 'green' : 'red';
  };

  const getActionLabel = (action) => {
    const actionLabels = {
      login: 'تسجيل الدخول',
      logout: 'تسجيل الخروج',
      login_failed: 'فشل تسجيل الدخول',
      create_article: 'إنشاء مقال',
      edit_article: 'تعديل مقال',
      delete_article: 'حذف مقال',
      create_user: 'إنشاء مستخدم',
      edit_user: 'تعديل مستخدم',
      delete_user: 'حذف مستخدم',
      update_settings: 'تحديث الإعدادات',
      backup_created: 'إنشاء نسخة احتياطية',
      system_maintenance: 'صيانة النظام'
    };
    return actionLabels[action] || action;
  };

  const columns = [
    {
      title: 'المستخدم',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserOutlined />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
          {record.userId === '1' && (
            <Badge color="red" text="مدير" />
          )}
        </div>
      ),
    },
    {
      title: 'الإجراء',
      key: 'action',
      render: (_, record) => (
        <Space>
          {getActionIcon(record.action)}
          <span>{getActionLabel(record.action)}</span>
        </Space>
      ),
    },
    {
      title: 'النوع',
      dataIndex: 'actionType',
      key: 'actionType',
      render: (actionType) => (
        <Tag color={getActionColor(actionType)}>
          {actionType === 'auth' ? 'مصادقة' :
           actionType === 'content' ? 'محتوى' :
           actionType === 'admin' ? 'إدارة' :
           actionType === 'system' ? 'نظام' : actionType}
        </Tag>
      ),
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'success' ? 'نجح' : 'فشل'}
        </Tag>
      ),
    },
    {
      title: 'عنوان IP',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      render: (ip) => (
        <Tooltip title={ip}>
          <Text code>{ip}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'التاريخ والوقت',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div>
          <div>{dayjs(date).format('YYYY/MM/DD')}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {dayjs(date).format('HH:mm:ss')}
          </div>
        </div>
      ),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = !filters.searchText ||
      activity.username.toLowerCase().includes(filters.searchText.toLowerCase()) ||
      activity.description.toLowerCase().includes(filters.searchText.toLowerCase());

    const matchesActionType = filters.actionType === 'all' ||
      activity.actionType === filters.actionType;

    const matchesUserType = filters.userType === 'all' ||
      (filters.userType === 'admin' && activity.userRole === 'admin') ||
      (filters.userType === 'editor' && activity.userRole === 'editor');

    const matchesDateRange = !filters.dateRange ||
      (dayjs(activity.createdAt).isAfter(filters.dateRange[0]) &&
       dayjs(activity.createdAt).isBefore(filters.dateRange[1]));

    return matchesSearch && matchesActionType && matchesUserType && matchesDateRange;
  });

  return (
    <>
      <Helmet>
        <title>سجل النشاطات | لوحة التحكم</title>
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
              سجل النشاطات
            </Title>
            <Text type="secondary">
              مراقبة نشاطات المستخدمين والعمليات
            </Text>
          </div>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={fetchActivities}
          >
            تحديث
          </Button>
        </div>

        {/* الإحصائيات */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي النشاطات"
                value={stats.total}
                valueStyle={{ color: '#3498db' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="اليوم"
                value={stats.today}
                valueStyle={{ color: '#27ae60' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="هذا الأسبوع"
                value={stats.thisWeek}
                valueStyle={{ color: '#f39c12' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="هذا الشهر"
                value={stats.thisMonth}
                valueStyle={{ color: '#e74c3c' }}
              />
            </Card>
          </Col>
        </Row>

        {/* الفلاتر */}
        <Card style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="البحث في النشاطات..."
                prefix={<SearchOutlined />}
                value={filters.searchText}
                onChange={(e) => handleFilterChange('searchText', e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="نوع الإجراء"
                value={filters.actionType}
                onChange={(value) => handleFilterChange('actionType', value)}
                style={{ width: '100%' }}
              >
                <Option value="all">جميع الأنواع</Option>
                <Option value="auth">مصادقة</Option>
                <Option value="content">محتوى</Option>
                <Option value="admin">إدارة</Option>
                <Option value="system">نظام</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="نوع المستخدم"
                value={filters.userType}
                onChange={(value) => handleFilterChange('userType', value)}
                style={{ width: '100%' }}
              >
                <Option value="all">جميع المستخدمين</Option>
                <Option value="admin">مديرين</Option>
                <Option value="editor">محررين</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                placeholder={['من تاريخ', 'إلى تاريخ']}
                value={filters.dateRange}
                onChange={(dates) => handleFilterChange('dateRange', dates)}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Card>

        {/* جدول النشاطات */}
        <Card>
          <Table
            columns={columns}
            dataSource={filteredActivities}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} من ${total} نشاط`
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </div>
    </>
  );
};

export default ActivityLog;
