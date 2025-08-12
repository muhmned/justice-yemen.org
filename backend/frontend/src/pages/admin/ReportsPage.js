import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useAuth } from '../../hooks/useAuth';
import { Select, Button, Table, Tag, Card, Row, Col, Typography, DatePicker } from 'antd';

const { Option } = Select;
const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const UsersReport = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const { token } = useAuth();

  const fetchUsers = async (status) => {
    setLoading(true);
    try {
      const params = {};
      if (status && status !== 'all') {
        params.status = status;
      }
      const response = await api.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers(statusFilter);
    }
  }, [token, statusFilter]);

  const columns = [
    { title: 'اسم المستخدم', dataIndex: 'username', key: 'username' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'الدور', dataIndex: 'role', key: 'role' },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? 'نشط' : 'غير نشط'}</Tag>
      ),
    },
    {
      title: 'تاريخ التسجيل',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('ar-SA'),
    },
  ];

  return (
    <Card
      title="تقرير المستخدمين"
      className="mt-4"
    >
      <div>
        <Select
          defaultValue="all"
          style={{ width: 150, marginBottom: 16 }}
          onChange={(value) => setStatusFilter(value)}
        >
          <Option value="all">كل الحالات</Option>
          <Option value="active">نشط</Option>
          <Option value="inactive">غير نشط</Option>
        </Select>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
      </div>
    </Card>
  );
};

const ActivityLogReport = () => {
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userId: null,
    dates: null,
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users for filter', error);
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.userId) {
        params.userId = filters.userId;
      }
      if (filters.dates && filters.dates.length === 2) {
        params.startDate = filters.dates[0].toISOString();
        params.endDate = filters.dates[1].toISOString();
      }
      const response = await api.get('/api/admin/activity-log', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setActivities(response.data.activities);
    } catch (error) {
      console.error('Failed to fetch activity log', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
      fetchActivities();
  };
  
  useEffect(() => {
      fetchActivities();
  }, [token]);


  const columns = [
    { title: 'المستخدم', dataIndex: 'username', key: 'username' },
    { title: 'الإجراء', dataIndex: 'action', key: 'action' },
    { title: 'نوع الإجراء', dataIndex: 'actionType', key: 'actionType' },
    { title: 'التفاصيل', dataIndex: 'details', key: 'details' },
    { title: 'عنوان IP', dataIndex: 'ipAddress', key: 'ipAddress' },
    {
      title: 'التاريخ',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('ar-SA'),
    },
  ];

  return (
    <Card
      title="تقرير سجل النشاط"
      className="mt-4"
    >
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="اختر مستخدم"
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('userId', value)}
              allowClear
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <RangePicker
              onChange={(dates) => handleFilterChange('dates', dates)}
              placeholder={['تاريخ البدء', 'تاريخ الانتهاء']}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              بحث
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={activities}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
      </div>
    </Card>
  );
};

const NewsReport = () => {
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    userId: null,
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users for filter', error);
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.userId) {
        params.userId = filters.userId;
      }
      const response = await api.get('/api/news', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setNews(response.data);
    } catch (error) {
      console.error('Failed to fetch news', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchNews();
  };
  
  useEffect(() => {
    fetchNews();
  }, [token]);

  const columns = [
    { title: 'العنوان', dataIndex: 'title', key: 'title' },
    { title: 'المؤلف', dataIndex: ['user', 'username'], key: 'author' },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'منشور' : 'مسودة'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ النشر',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => (date ? new Date(date).toLocaleDateString('ar-SA') : 'N/A'),
    },
  ];

  return (
    <Card
      title="تقرير الأخبار"
      className="mt-4"
    >
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="اختر الحالة"
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('status', value)}
              defaultValue="all"
            >
              <Option value="all">الكل</Option>
              <Option value="published">منشور</Option>
              <Option value="draft">مسودة</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="اختر المؤلف"
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('userId', value)}
              allowClear
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              بحث
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={news}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
      </div>
    </Card>
  );
};

const ReportsListReport = () => {
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    userId: null,
    dates: null,
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users for filter', error);
      }
    };
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status && filters.status !== 'all') {
        params.status = filters.status;
      }
      if (filters.userId) {
        params.userId = filters.userId;
      }
      if (filters.dates && filters.dates.length === 2) {
        params.startDate = filters.dates[0].toISOString();
        params.endDate = filters.dates[1].toISOString();
      }
      const response = await api.get('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setReports(response.data);
    } catch (error) {
      console.error('Failed to fetch reports', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchReports();
  };
  
  useEffect(() => {
    fetchReports();
  }, [token]);

  const columns = [
    { title: 'العنوان', dataIndex: 'title', key: 'title' },
    { title: 'المؤلف', dataIndex: ['user', 'username'], key: 'author' },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'منشور' : 'مسودة'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ النشر',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => (date ? new Date(date).toLocaleDateString('ar-SA') : 'N/A'),
    },
  ];

  return (
    <Card
      title="قائمة التقارير"
      className="mt-4"
    >
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="اختر الحالة"
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('status', value)}
              defaultValue="all"
            >
              <Option value="all">الكل</Option>
              <Option value="published">منشور</Option>
              <Option value="draft">مسودة</Option>
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="اختر المؤلف"
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('userId', value)}
              allowClear
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <RangePicker
              onChange={(dates) => handleFilterChange('dates', dates)}
              placeholder={['تاريخ البدء', 'تاريخ الانتهاء']}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              بحث
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
      </div>
    </Card>
  );
};

const ArticlesReport = () => {
  const [articles, setArticles] = useState([]);
  const [users, setUsers] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    sectionId: null,
    userId: null,
  });
  const { token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, sectionsRes] = await Promise.all([
          api.get('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/api/sections', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setUsers(usersRes.data);
        setSections(sectionsRes.data);
      } catch (error) {
        console.error('Failed to fetch users or sections', error);
      }
    };
    if (token) {
      fetchData();
    }
  }, [token]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.sectionId) {
        params.sectionId = filters.sectionId;
      }
      if (filters.userId) {
        params.userId = filters.userId;
      }
      const response = await api.get('/api/articles', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setArticles(response.data);
    } catch (error) {
      console.error('Failed to fetch articles', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchArticles();
  };
  
  useEffect(() => {
    fetchArticles();
  }, [token]);

  const columns = [
    { title: 'العنوان', dataIndex: 'title', key: 'title' },
    { title: 'المؤلف', dataIndex: ['User', 'username'], key: 'author' },
    { title: 'القسم', dataIndex: ['Section', 'name'], key: 'section' },
    {
      title: 'تاريخ النشر',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => (date ? new Date(date).toLocaleDateString('ar-SA') : 'N/A'),
    },
  ];

  return (
    <Card
      title="تقرير المقالات"
      className="mt-4"
    >
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="اختر القسم"
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('sectionId', value)}
              allowClear
            >
              {sections.map((section) => (
                <Option key={section.id} value={section.id}>
                  {section.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="اختر المؤلف"
              style={{ width: 200 }}
              onChange={(value) => handleFilterChange('userId', value)}
              allowClear
            >
              {users.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username}
                </Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              بحث
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={articles}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
      </div>
    </Card>
  );
};

const MessagesReport = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'ALL',
    dates: null,
  });
  const { token } = useAuth();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100, // Fetch more for the report
      };
      if (filters.status && filters.status !== 'ALL') {
        params.status = filters.status;
      }
      if (filters.dates && filters.dates.length === 2) {
        params.startDate = filters.dates[0].toISOString();
        params.endDate = filters.dates[1].toISOString();
      }
      const response = await api.get('/api/messages', {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    fetchMessages();
  };
  
  useEffect(() => {
    fetchMessages();
  }, [token]);

  const columns = [
    { title: 'الاسم', dataIndex: 'name', key: 'name' },
    { title: 'البريد الإلكتروني', dataIndex: 'email', key: 'email' },
    { title: 'الموضوع', dataIndex: 'subject', key: 'subject' },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'geekblue';
        let text = 'غير مقروء';
        if (status === 'READ') {
          color = 'green';
          text = 'مقروء';
        }
        if (status === 'REPLIED') {
          color = 'volcano';
          text = 'تم الرد';
        }
        if (status === 'ARCHIVED') {
          color = 'gold';
          text = 'مؤرشف';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'تاريخ الاستلام',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('ar-SA'),
    },
  ];

  return (
    <Card
      title="تقرير رسائل الاتصال"
      className="mt-4"
    >
      <div>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col>
            <Select
              placeholder="اختر الحالة"
              style={{ width: 150 }}
              onChange={(value) => handleFilterChange('status', value)}
              defaultValue="ALL"
            >
              <Option value="ALL">الكل</Option>
              <Option value="UNREAD">غير مقروء</Option>
              <Option value="READ">مقروء</Option>
              <Option value="REPLIED">تم الرد</Option>
              <Option value="ARCHIVED">مؤرشف</Option>
            </Select>
          </Col>
          <Col>
            <RangePicker
              onChange={(dates) => handleFilterChange('dates', dates)}
              placeholder={['تاريخ البدء', 'تاريخ الانتهاء']}
            />
          </Col>
          <Col>
            <Button type="primary" onClick={handleSearch}>
              بحث
            </Button>
          </Col>
        </Row>
        <Table
          dataSource={messages}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: true }}
        />
      </div>
    </Card>
  );
};


const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/stats/general', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(response.data);
      } catch (err) {
        setError('Failed to fetch stats. You might not have the required permissions.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    } else {
      setError('Authentication token not found.');
      setLoading(false);
    }
  }, [token]);

  if (loading) {
    return <div>جار التحميل...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div className="container-fluid">
      <Title level={2}>التقارير والإحصائيات</Title>
      {stats && (
        <Card title="الإحصائيات العامة">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Text strong>المستخدمون</Text>
                <Title level={4}>{stats.userCount}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Text strong>الأنشطة</Text>
                <Title level={4}>{stats.activityLogCount}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Text strong>المقالات</Text>
                <Title level={4}>{stats.articleCount}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Text strong>الأقسام</Text>
                <Title level={4}>{stats.sectionCount}</Title>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Text strong>الأخبار</Text>
                <p>المنشورة: {stats.newsCount.published}</p>
                <p>المسودات: {stats.newsCount.draft}</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Card>
                <Text strong>التقارير</Text>
                <p>المنشورة: {stats.reportsCount.published}</p>
                <p>المسودات: {stats.reportsCount.draft}</p>
              </Card>
            </Col>
            <Col xs={24} sm={12} md={8} lg={12}>
              <Card>
                <Text strong>رسائل الاتصال</Text>
                <ul>
                  <li>غير مقروءة: {stats.contactMessagesCount.UNREAD}</li>
                  <li>مقروءة: {stats.contactMessagesCount.READ}</li>
                  <li>تم الرد عليها: {stats.contactMessagesCount.REPLIED}</li>
                  <li>مؤرشفة: {stats.contactMessagesCount.ARCHIVED}</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
      
      <UsersReport />
      <ActivityLogReport />
      <NewsReport />
      <ReportsListReport />
      <ArticlesReport />
      <MessagesReport />

    </div>
  );
};

export default ReportsPage;
