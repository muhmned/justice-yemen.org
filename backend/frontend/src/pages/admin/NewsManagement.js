import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Tag, Statistic, Row, Col, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NewsManagement = () => {
  const { hasPermission } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      console.log('جاري جلب الأخبار...');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/news`);
      console.log('استجابة الخادم:', res.status, res.statusText);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      let data = await res.json();
      console.log('البيانات المستلمة:', data);
      
      if (!Array.isArray(data)) {
        console.warn('البيانات ليست مصفوفة:', data);
        data = [];
      }
      
      setNews(data);
    } catch (error) {
      console.error('خطأ في جلب الأخبار:', error);
      message.error('تعذر جلب الأخبار: ' + error.message);
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        message.success('تم حذف الخبر بنجاح');
        fetchNews(); // إعادة تحميل القائمة
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'تعذر حذف الخبر');
      }
    } catch (error) {
      console.error('خطأ في حذف الخبر:', error);
      message.error('تعذر الاتصال بالخادم');
    }
  };

  const handleEdit = (newsItem) => {
    console.log('تعديل الخبر:', newsItem);
    
    // التحقق من البيانات
    if (!newsItem || !newsItem.id) {
      message.error('بيانات الخبر غير صحيحة');
      return;
    }
    
    // حفظ الخبر في localStorage للاختبار
    try {
      localStorage.setItem('currentNews', JSON.stringify(newsItem));
      console.log('تم حفظ الخبر في localStorage');
    } catch (error) {
      console.error('خطأ في حفظ localStorage:', error);
      message.warning('تعذر حفظ البيانات المحلية');
    }
    
    // الانتقال لصفحة التعديل
    navigate(`/admin/edit-news/${newsItem.id}`);
  };

  const handlePreview = (newsItem) => {
    setSelectedNews(newsItem);
    setPreviewVisible(true);
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
    setSelectedNews(null);
  };

  const columns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <b>{text}</b>
    },
    {
      title: 'الملخص',
      dataIndex: 'summary',
      key: 'summary',
      render: (text) => text ? text.substring(0, 100) + (text.length > 100 ? '...' : '') : '-'
    },
    {
      title: 'تاريخ النشر',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => date ? new Date(date).toLocaleDateString('ar-EG') : '-'
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'published' ? 'green' : 'orange'}>
          {status === 'published' ? 'منشور' : 'مسودة'}
        </Tag>
      )
    },
    {
      title: 'عرض الخبر',
      key: 'preview',
      render: (_, record) => (
        <Button icon={<EyeOutlined />} onClick={() => handlePreview(record)}>
          عرض
        </Button>
      )
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button icon={<EyeOutlined />} style={{ marginInlineEnd: 8 }} onClick={() => handlePreview(record)} />
          {hasPermission('edit_news') && (
            <Button icon={<EditOutlined />} style={{ marginInlineEnd: 8 }} onClick={() => handleEdit(record)} />
          )}
          {hasPermission('delete_news') && (
            <Popconfirm title="هل أنت متأكد من حذف هذا الخبر؟" onConfirm={() => handleDelete(record.id)} okText="نعم" cancelText="إلغاء">
              <Button icon={<DeleteOutlined />} danger />
            </Popconfirm>
          )}
        </>
      )
    }
  ];

  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <Row gutter={16} align="middle" style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Statistic title="عدد الأخبار المنشورة" value={news.length} />
        </Col>
        <Col span={12} style={{ textAlign: 'left' }}>
          {hasPermission('add_news') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/add-news')}>
              إضافة خبر
            </Button>
          )}
       {/*   <Button icon={<ReloadOutlined />} style={{ marginInlineStart: 8 }} onClick={fetchNews} />*/}
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={news}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} من ${total} خبر`
        }}
        locale={{
          emptyText: 'لا توجد أخبار',
          triggerDesc: 'ترتيب تنازلي',
          triggerAsc: 'ترتيب تصاعدي',
          cancelSort: 'إلغاء الترتيب'
        }}
      />

      {/* Modal لعرض تفاصيل الخبر */}
      <Modal
        title={selectedNews?.title}
        open={previewVisible}
        onCancel={handlePreviewClose}
        footer={[
          <Button key="back" onClick={handlePreviewClose}>
            إغلاق
          </Button>,
          <Button key="edit" type="primary" onClick={() => {
            handlePreviewClose();
            handleEdit(selectedNews);
          }}>
            تعديل
          </Button>
        ]}
        width={800}
      >
        {selectedNews && (
          <div>
            {selectedNews.image && (
              <img 
          src={`${process.env.REACT_APP_API_URL}${selectedNews.image}`}
                alt={selectedNews.title}
                style={{ width: '100%', maxHeight: 300, objectFit: 'cover', marginBottom: 16 }}
              />
            )}
            <div style={{ marginBottom: 16 }}>
              <strong>الملخص:</strong>
              <p>{selectedNews.summary}</p>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>المحتوى:</strong>
              <div dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
            </div>
            <div>
              <strong>تاريخ النشر:</strong> {selectedNews.publishDate ? new Date(selectedNews.publishDate).toLocaleDateString('ar-EG') : 'غير محدد'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NewsManagement;
