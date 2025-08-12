import React, { useEffect, useState } from 'react';
import { Table, Button, Popconfirm, message, Tag, Statistic, Row, Col, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const ArticleManagement = () => {
  const { hasPermission } = useAuth();
  const [articles, setArticles] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSections();
    fetchArticles();
  }, []);

  const fetchSections = async () => {
    const res = await fetch('http://localhost:5000/api/sections');
    const data = await res.json();
    setSections(Array.isArray(data) ? data : []);
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      console.log('جاري جلب المقالات...');
      const res = await fetch('http://localhost:5000/api/articles');
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
      
      setArticles(data);
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
      message.error('تعذر جلب المقالات: ' + error.message);
      setArticles([]);
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

      const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.ok) {
        message.success('تم حذف المقال بنجاح');
        fetchArticles(); // إعادة تحميل القائمة
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'تعذر حذف المقال');
      }
    } catch (error) {
      console.error('خطأ في حذف المقال:', error);
      message.error('تعذر الاتصال بالخادم');
    }
  };

  const handleEdit = (article) => {
    console.log('تعديل المقال:', article);
    
    // التحقق من البيانات
    if (!article || !article.id) {
      message.error('بيانات المقال غير صحيحة');
      return;
    }
    
    // حفظ المقال في localStorage للاختبار
    try {
      localStorage.setItem('currentArticle', JSON.stringify(article));
      console.log('تم حفظ المقال في localStorage');
    } catch (error) {
      console.error('خطأ في حفظ localStorage:', error);
      message.warning('تعذر حفظ البيانات المحلية');
    }
    
    // الانتقال لصفحة التعديل
    navigate(`/admin/edit-article/${article.id}`);
  };

  const handlePreview = (article) => {
    setSelectedArticle(article);
    setPreviewVisible(true);
  };

  const handlePreviewClose = () => {
    setPreviewVisible(false);
    setSelectedArticle(null);
  };

  const columns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <b>{text}</b>
    },
    {
      title: 'القسم',
      dataIndex: 'Section',
      key: 'Section',
      render: (Section) => Section ? Section.name : <Tag color="red">غير محدد</Tag>,
      filters: sections.map(s => ({ text: s.name, value: s.id })),
      onFilter: (value, record) => record.Section && record.Section.id === value
    },
    {
      title: 'تاريخ النشر',
      dataIndex: 'publishDate',
      key: 'publishDate',
      render: (date) => date ? new Date(date).toLocaleDateString('ar-EG') : '-'
    },
    {
      title: 'عرض المقال',
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
          {hasPermission('edit_article') && (
            <Button icon={<EditOutlined />} style={{ marginInlineEnd: 8 }} onClick={() => handleEdit(record)} />
          )}
          {hasPermission('delete_article') && (
            <Popconfirm title="هل أنت متأكد من حذف هذا المقال؟" onConfirm={() => handleDelete(record.id)} okText="نعم" cancelText="إلغاء">
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
          <Statistic title="عدد المقالات المنشورة" value={articles.length} />
        </Col>
        <Col span={12} style={{ textAlign: 'left' }}>
          {hasPermission('add_article') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/add-article')}>
              إضافة مقال
            </Button>
          )}
         {/* 
          <Button icon={<ReloadOutlined />} style={{ marginInlineStart: 8 }} onClick={fetchArticles} />
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              console.log('اختبار الاتصال...');
              fetch('http://localhost:5000/api/articles')
                .then(res => {
                  console.log('استجابة الخادم:', res.status);
                  return res.json();
                })
                .then(data => {
                  console.log('البيانات:', data);
                  alert(`تم جلب ${Array.isArray(data) ? data.length : 0} مقال`);
                })
                .catch(err => {
                  console.error('خطأ:', err);
                  alert('خطأ في الاتصال: ' + err.message);
                });
            }}
          >
            اختبار الاتصال
          </Button>
          <Button 
            type="dashed" 
            danger
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              const token = localStorage.getItem('admin_token');
              if (!token) {
                alert('يجب تسجيل الدخول أولاً');
                return;
              }
              
              const articleId = articles[0]?.id;
              if (!articleId) {
                alert('لا توجد مقالات للحذف');
                return;
              }
              
              if (window.confirm('هل تريد حذف أول مقال في القائمة؟')) {
                fetch(`http://localhost:5000/api/articles/${articleId}`, {
                  method: 'DELETE',
                  headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                })
                .then(res => {
                  console.log('استجابة الحذف:', res.status);
                  if (res.ok) {
                    alert('تم حذف المقال بنجاح');
                    fetchArticles();
                  } else {
                    return res.json();
                  }
                })
                .then(data => {
                  if (data) {
                    alert('خطأ في الحذف: ' + (data.error || 'خطأ غير معروف'));
                  }
                })
                .catch(err => {
                  console.error('خطأ في الحذف:', err);
                  alert('خطأ في الاتصال: ' + err.message);
                });
              }
            }}
          >
            اختبار الحذف
          </Button>
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              const article = articles[0];
              if (!article) {
                alert('لا توجد مقالات للتعديل');
                return;
              }
              
              console.log('اختبار التعديل للمقال:', article);
              console.log('ID المقال:', article.id);
              console.log('عنوان المقال:', article.title);
              
              // اختبار الانتقال مباشرة
              const testUrl = `/admin/edit-article/${article.id}`;
              console.log('URL الاختبار:', testUrl);
              
              // اختبار localStorage
              try {
                localStorage.setItem('testArticle', JSON.stringify(article));
                console.log('تم حفظ المقال في localStorage للاختبار');
              } catch (error) {
                console.error('خطأ في حفظ localStorage:', error);
              }
              
              // الانتقال لصفحة التعديل
              handleEdit(article);
            }}
          >
            اختبار التعديل
          </Button>
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              const article = articles[0];
              if (!article) {
                alert('لا توجد مقالات للتعديل');
                return;
              }
              
              console.log('اختبار التعديل المباشر للمقال:', article.id);
              
              // الانتقال المباشر بدون handleEdit
              navigate(`/admin/edit-article/${article.id}`);
            }}
          >
            اختبار التعديل المباشر
          </Button>
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              const article = articles[0];
              if (!article) {
                alert('لا توجد مقالات للتعديل');
                return;
              }
              
              console.log('اختبار التعديل المحسن للمقال:', article);
              console.log('ID المقال:', article.id);
              console.log('عنوان المقال:', article.title);
              
              // اختبار البيانات قبل الانتقال
              if (!article.id) {
                alert('خطأ: لا يوجد ID للمقال');
                return;
              }
              
              if (!article.title) {
                alert('خطأ: لا يوجد عنوان للمقال');
                return;
              }
              
              // اختبار localStorage
              try {
                localStorage.setItem('testArticleEnhanced', JSON.stringify(article));
                console.log('تم حفظ المقال في localStorage للاختبار المحسن');
              } catch (error) {
                console.error('خطأ في حفظ localStorage:', error);
                alert('خطأ في حفظ البيانات المحلية');
                return;
              }
              
              // الانتقال لصفحة التعديل
              handleEdit(article);
            }}
          >
            اختبار التعديل المحسن
          </Button>
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              const article = articles[0];
              if (!article) {
                alert('لا توجد مقالات للتعديل');
                return;
              }
              
              console.log('اختبار رفع الصورة للمقال:', article.id);
              
              // الانتقال لصفحة التعديل لاختبار رفع الصورة
              navigate(`/admin/edit-article/${article.id}`);
            }}
          >
            اختبار رفع الصورة
          </Button>
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              const article = articles[0];
              if (!article) {
                alert('لا توجد مقالات للتعديل');
                return;
              }
              
              console.log('اختبار رفع الصورة المحسن للمقال:', article.id);
              console.log('بيانات المقال:', article);
              
              // اختبار البيانات قبل الانتقال
              if (!article.id) {
                alert('خطأ: لا يوجد ID للمقال');
                return;
              }
              
              if (!article.title) {
                alert('خطأ: لا يوجد عنوان للمقال');
                return;
              }
              
              // اختبار localStorage
              try {
                localStorage.setItem('testArticleImage', JSON.stringify(article));
                console.log('تم حفظ المقال في localStorage لاختبار الصور');
              } catch (error) {
                console.error('خطأ في حفظ localStorage:', error);
                alert('خطأ في حفظ البيانات المحلية');
                return;
              }
              
              // الانتقال لصفحة التعديل
              navigate(`/admin/edit-article/${article.id}`);
            }}
          >
            اختبار رفع الصورة المحسن
          </Button>
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              console.log('اختبار إضافة مقال مع صورة');
              
              // الانتقال لصفحة إضافة مقال
              navigate('/admin/add-article');
            }}
          >
            اختبار إضافة مقال مع صورة
          </Button>
          <Button 
            type="dashed" 
            style={{ marginInlineStart: 8 }} 
            onClick={() => {
              console.log('اختبار رفع الصورة المحسن');
              
              // اختبار localStorage
              try {
                const testData = {
                  id: 'test-article-id',
                  title: 'مقال تجريبي للصورة',
                  content: 'محتوى تجريبي',
                  sectionId: 'test-section-id'
                };
                
                localStorage.setItem('testImageUpload', JSON.stringify(testData));
                console.log('تم حفظ بيانات الاختبار في localStorage');
                message.success('تم حفظ بيانات الاختبار بنجاح');
              } catch (error) {
                console.error('خطأ في حفظ localStorage:', error);
                message.error('خطأ في حفظ البيانات المحلية');
              }
            }}
          >
            اختبار حفظ البيانات المحلية
          </Button>
          */}
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={articles}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        bordered
      />

      <Modal
        title="تفاصيل المقال"
        visible={previewVisible}
        onCancel={handlePreviewClose}
        footer={null}
        width="80%"
        style={{ maxWidth: 800 }}
      >
        {selectedArticle && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '16px', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px' }}>
              <h2 style={{ color: '#1890ff', marginBottom: '8px' }}>{selectedArticle.title}</h2>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Tag color="blue">القسم: {selectedArticle.section ? selectedArticle.section.name : 'غير محدد'}</Tag>
                <Tag color="green">تاريخ النشر: {selectedArticle.publishDate ? new Date(selectedArticle.publishDate).toLocaleDateString('ar-EG') : '-'}</Tag>
                <Tag color="orange">المستخدم: {selectedArticle.user ? selectedArticle.user.username : 'غير محدد'}</Tag>
              </div>
            </div>
            
            {selectedArticle.image && (
              <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                <img 
                  src={`http://localhost:5000${selectedArticle.image}`} 
                  alt="صورة المقال" 
                  style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
                />
              </div>
            )}
            
            <div style={{ marginBottom: '16px' }}>
              <h3>محتوى المقال:</h3>
              <div 
                style={{ 
                  border: '1px solid #f0f0f0', 
                  padding: '16px', 
                  borderRadius: '8px',
                  backgroundColor: '#fafafa',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  whiteSpace: 'pre-wrap',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
              >
                {selectedArticle.content ? selectedArticle.content.replace(/<[^>]*>/g, '') : 'لا يوجد محتوى'}
              </div>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button type="primary" onClick={() => handleEdit(selectedArticle)} style={{ marginRight: '8px' }}>
                تعديل المقال
              </Button>
              <Button onClick={handlePreviewClose}>
                إغلاق
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ArticleManagement;
