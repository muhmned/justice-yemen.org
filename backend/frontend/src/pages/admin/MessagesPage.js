import React, { useState, useEffect, useCallback } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  message, 
  Space, 
  Tag, 
  Input, 
  Select, 
  Pagination,
  Card,
  Row,
  Col,
  Statistic,
  Badge,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  MailOutlined, 
  EyeOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

import './MessagesPage.css';

const { Search } = Input;
const { Option } = Select;

const MessagesPage = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'ALL',
    search: ''
  });
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    read: 0,
    replied: 0,
    archived: 0,
    recentMessages: 0
  });

  const fetchMessages = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.current,
        limit: pagination.pageSize,
        status: filters.status,
        search: filters.search
      });

      const response = await fetch(`http://localhost:5000/api/messages?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.totalItems
        }));
      } else {
        message.error('فشل في جلب الرسائل');
      }
    } catch (error) {
      console.error('خطأ في جلب الرسائل:', error);
      message.error('حدث خطأ في الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  }, [token, pagination.current, pagination.pageSize, filters]);

  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch('http://localhost:5000/api/messages/stats/overview', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchMessages();
    fetchStats();
  }, [fetchMessages, fetchStats]);

  const handleViewMessage = async (id) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const messageData = await response.json();
        setSelectedMessage(messageData);
        setModalVisible(true);

        if (!messageData.isRead) {
          await updateMessageStatus(id, { isRead: true });
        }
      } else {
        message.error('فشل في جلب تفاصيل الرسالة');
      }
    } catch (error) {
      console.error('خطأ في جلب تفاصيل الرسالة:', error);
      message.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const updateMessageStatus = async (id, statusData) => {
    if (!token) {
      message.error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول مرة أخرى');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(statusData),
      });

      if (response.ok) {
        const updatedMessage = await response.json();
        setMessages(prev =>
          prev.map(msg =>
            msg.id === id
              ? { ...msg, ...updatedMessage }
              : msg
          )
        );
        fetchStats();
        
        // رسالة نجاح
        if (statusData.status === 'READ') {
          message.success('تم تحديد الرسالة كمقروءة');
        } else if (statusData.status === 'REPLIED') {
          message.success('تم تحديد الرسالة كرد عليها');
        } else if (statusData.status === 'ARCHIVED') {
          message.success('تم أرشفة الرسالة');
        } else if (statusData.isRead) {
          message.success('تم تحديث حالة الرسالة');
        }
      } else {
        const errorData = await response.json();
        if (response.status === 401) {
          message.error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى');
        } else if (response.status === 403) {
          message.error('ليس لديك صلاحية لتحديث هذه الرسالة');
        } else if (response.status === 404) {
          message.error('الرسالة غير موجودة');
        } else {
          message.error(errorData.error || 'فشل في تحديث حالة الرسالة');
        }
      }
    } catch (error) {
      console.error('خطأ في تحديث حالة الرسالة:', error);
      message.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        message.success('تم حذف الرسالة بنجاح');
        fetchMessages();
        fetchStats();
      } else {
        message.error('فشل في حذف الرسالة');
      }
    } catch (error) {
      console.error('خطأ في حذف الرسالة:', error);
      message.error('حدث خطأ في الاتصال بالخادم');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'UNREAD': return 'red';
      case 'READ': return 'blue';
      case 'REPLIED': return 'green';
      case 'ARCHIVED': return 'gray';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'UNREAD': return 'غير مقروءة';
      case 'READ': return 'مقروءة';
      case 'REPLIED': return 'تم الرد';
      case 'ARCHIVED': return 'مؤرشفة';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'المرسل',
      dataIndex: 'name',
      key: 'name',
      onCell: () => ({ 'data-label': 'المرسل' }),
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      )
    },
    {
      title: 'الموضوع',
      dataIndex: 'subject',
      key: 'subject',
      onCell: () => ({ 'data-label': 'الموضوع' }),
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {new Date(record.createdAt).toLocaleString('ar-SA')}
          </div>
        </div>
      )
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      onCell: () => ({ 'data-label': 'الحالة' }),
      render: (status, record) => (
        <Space>
          <Badge 
            status={record.isRead ? 'default' : 'processing'} 
            text={record.isRead ? 'مقروءة' : 'جديدة'}
          />
          <Tag color={getStatusColor(status)}>
            {getStatusText(status)}
          </Tag>
        </Space>
      )
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      onCell: () => ({ 'data-label': 'الإجراءات' }),
      render: (_, record) => (
        <Space>
          <Tooltip title="عرض الرسالة">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewMessage(record.id)}
            />
          </Tooltip>
          
          {record.status === 'UNREAD' && (
            <Tooltip title="تحديد كمقروءة">
              <Button 
                icon={<CheckCircleOutlined />} 
                size="small"
                onClick={() => updateMessageStatus(record.id, { status: 'READ', isRead: true })}
              />
            </Tooltip>
          )}
          
          {record.status === 'READ' && (
            <Tooltip title="تحديد كرد عليها">
              <Button 
                icon={<MessageOutlined />} 
                size="small"
                onClick={() => updateMessageStatus(record.id, { status: 'REPLIED' })}
              />
            </Tooltip>
          )}
          
          {(record.status === 'READ' || record.status === 'REPLIED') && (
            <Tooltip title="أرشفة الرسالة">
              <Button 
                icon={<MailOutlined />} 
                size="small"
                onClick={() => updateMessageStatus(record.id, { status: 'ARCHIVED' })}
              />
            </Tooltip>
          )}
          
          <Popconfirm
            title="هل أنت متأكد من حذف هذه الرسالة؟"
            onConfirm={() => handleDeleteMessage(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Tooltip title="حذف الرسالة">
              <Button 
                danger 
                icon={<DeleteOutlined />} 
                size="small"
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="messages-page">
      <div className="page-header">
        <h1>إدارة الرسائل</h1>
        <p>إدارة رسائل الاتصال الواردة من الموقع</p>
      </div>

      {/* إحصائيات سريعة */}
      <Row gutter={[16, 16]} className="stats-row" style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="إجمالي الرسائل"
              value={stats.total}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="رسائل جديدة"
              value={stats.unread}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="مقروءة"
              value={stats.read}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="تم الرد عليها"
              value={stats.replied}
              valueStyle={{ color: '#1890ff' }}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="مؤرشفة"
              value={stats.archived}
              valueStyle={{ color: '#666' }}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4}>
          <Card>
            <Statistic
              title="آخر 7 أيام"
              value={stats.recentMessages}
              valueStyle={{ color: '#722ed1' }}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* فلاتر البحث */}
      <Card className="filters-card" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12} lg={10}>
            <Search
              placeholder="البحث في الرسائل..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              onSearch={() => setPagination(prev => ({ ...prev, current: 1 }))}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Select
              placeholder="حالة الرسالة"
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              style={{ width: '100%' }}
            >
              <Option value="ALL">جميع الرسائل</Option>
              <Option value="UNREAD">غير مقروءة</Option>
              <Option value="READ">مقروءة</Option>
              <Option value="REPLIED">تم الرد عليها</Option>
              <Option value="ARCHIVED">مؤرشفة</Option>
            </Select>
          </Col>
          <Col xs={24} md={4} lg={4}>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setFilters({ status: 'ALL', search: '' });
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
              style={{ width: '100%' }}
            >
              إعادة تعيين
            </Button>
          </Col>
        </Row>
      </Card>

      {/* جدول الرسائل */}
      <Card>
        <Table
          columns={columns}
          dataSource={messages}
          rowKey="id"
          loading={loading}
          pagination={false}
          scroll={{ x: 800 }}
        />
        
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Pagination
            current={pagination.current}
            total={pagination.total}
            pageSize={pagination.pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} من ${total} رسالة`
            }
            onChange={(page, pageSize) => 
              setPagination(prev => ({ ...prev, current: page, pageSize }))
            }
            onShowSizeChange={(current, size) => 
              setPagination(prev => ({ ...prev, current: 1, pageSize: size }))
            }
          />
        </div>
      </Card>

      {/* Modal لعرض تفاصيل الرسالة */}
      <Modal
        title="تفاصيل الرسالة"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            إغلاق
          </Button>,
          selectedMessage && (
            <Button 
              key="reply" 
              type="primary"
              onClick={() => {
                updateMessageStatus(selectedMessage.id, { status: 'REPLIED' });
                setModalVisible(false);
              }}
            >
              تحديد كرد عليها
            </Button>
          )
        ]}
        width={800}
      >
        {selectedMessage && (
          <div className="message-details">
            <div className="message-header">
              <div className="sender-info">
                <h3>{selectedMessage.name}</h3>
                <p>{selectedMessage.email}</p>
                <p>التاريخ: {new Date(selectedMessage.createdAt).toLocaleString('ar-SA')}</p>
              </div>
              <div className="message-status">
                <Tag color={getStatusColor(selectedMessage.status)}>
                  {getStatusText(selectedMessage.status)}
                </Tag>
              </div>
            </div>
            
            <div className="message-subject">
              <h4>الموضوع: {selectedMessage.subject}</h4>
            </div>
            
            <div className="message-content">
              <h4>محتوى الرسالة:</h4>
              <div className="message-text">
                {selectedMessage.message.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MessagesPage;
