import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Tabs, Statistic, message, Spin } from 'antd';
import { 
  FileTextOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  EyeOutlined,
  BarChartOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import NewsManagement from './NewsManagement';
import ReportsManagement from './ReportsManagement';
import ArticleManagement from './ArticleManagement';

const { TabPane } = Tabs;

const ContentManagement = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('news');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    news: 0,
    reports: 0,
    articles: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      // جلب إحصائيات الأخبار
      const newsRes = await fetch('http://localhost:5000/api/news', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const newsData = await newsRes.json();
      
      // جلب إحصائيات التقارير
      const reportsRes = await fetch('http://localhost:5000/api/reports', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const reportsData = await reportsRes.json();
      
      // جلب إحصائيات المقالات
      const articlesRes = await fetch('http://localhost:5000/api/articles', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const articlesData = await articlesRes.json();
      
      setStats({
        news: Array.isArray(newsData) ? newsData.length : 0,
        reports: Array.isArray(reportsData) ? reportsData.length : 0,
        articles: Array.isArray(articlesData) ? articlesData.length : 0
      });
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
      message.error('تعذر جلب الإحصائيات');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const handleAddContent = (type) => {
    switch (type) {
      case 'news':
        navigate('/admin/add-news');
        break;
      case 'reports':
        navigate('/admin/add-report');
        break;
      case 'articles':
        navigate('/admin/add-article');
        break;
      default:
        break;
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 16 }}>إدارة المحتوى</h1>
        <p style={{ color: '#666', fontSize: 16 }}>
          إدارة الأخبار والتقارير والمقالات في مكان واحد
        </p>
      </div>

      {/* إحصائيات سريعة */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="الأخبار"
              value={stats.news}
              prefix={<FileTextOutlined />}
              suffix="خبر"
            />
            {hasPermission('add_news') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                style={{ marginTop: 8 }}
                onClick={() => handleAddContent('news')}
              >
                إضافة خبر
              </Button>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="التقارير"
              value={stats.reports}
              prefix={<BarChartOutlined />}
              suffix="تقرير"
            />
            {hasPermission('add_reports') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                style={{ marginTop: 8 }}
                onClick={() => handleAddContent('reports')}
              >
                إضافة تقرير
              </Button>
            )}
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="المقالات"
              value={stats.articles}
              prefix={<FileTextOutlined />}
              suffix="مقال"
            />
            {hasPermission('add_articles') && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                size="small"
                style={{ marginTop: 8 }}
                onClick={() => handleAddContent('articles')}
              >
                إضافة مقال
              </Button>
            )}
          </Card>
        </Col>
      </Row>

      {/* أزرار الإضافة السريعة */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {hasPermission('add_news') && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleAddContent('news')}
                >
                  إضافة خبر جديد
                </Button>
              )}
              {hasPermission('add_reports') && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleAddContent('reports')}
                >
                  إضافة تقرير جديد
                </Button>
              )}
              {hasPermission('add_articles') && (
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => handleAddContent('articles')}
                >
                  إضافة مقال جديد
                </Button>
              )}
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchStats}
                loading={loading}
              >
                تحديث الإحصائيات
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* تبويبات إدارة المحتوى */}
      <Card>
        <Tabs 
          activeKey={activeTab} 
          onChange={handleTabChange}
          type="card"
          size="large"
        >
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                الأخبار ({stats.news})
              </span>
            } 
            key="news"
          >
            <NewsManagement />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <BarChartOutlined />
                التقارير ({stats.reports})
              </span>
            } 
            key="reports"
          >
            <ReportsManagement />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <FileTextOutlined />
                المقالات ({stats.articles})
              </span>
            } 
            key="articles"
          >
            <ArticleManagement />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default ContentManagement; 