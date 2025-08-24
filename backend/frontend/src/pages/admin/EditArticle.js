import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Upload, message, Card, Row, Col, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

const { Option } = Select;
const { TextArea } = Input;

const EditNews = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState(null);
  const [categories, setCategories] = useState([]);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const cleanContent = (content) => {
    if (!content) return '';
    let cleaned = content;
    cleaned = cleaned.replace(/<script.*?>.*?<\/script>/gi, '');
    cleaned = cleaned.replace(/<iframe.*?>.*?<\/iframe>/gi, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  };

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        navigate('/admin/login');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/news/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const newsData = await res.json();
        setNews(newsData);
        setContent(cleanContent(newsData.content || ''));

        if (newsData.image) {
          const imageUrl = newsData.image.startsWith('http')
            ? newsData.image
            : `${process.env.REACT_APP_API_URL || ''}${newsData.image}`;
          setImagePreview(imageUrl);
        }
      } else {
        message.error('تعذر جلب الخبر');
      }
    } catch (error) {
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/news-categories/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategories();
      loadNews();
    }
  }, [id, loadNews]);

  useEffect(() => {
    if (news && !loading) {
      form.setFieldsValue({
        title: news.title,
        content: cleanContent(news.content || ''),
        categoryId: news.categoryId
      });
    }
  }, [news, loading, form]);

  const handleImageChange = (info) => {
    if (info.file && info.file.originFileObj) {
      const file = info.file.originFileObj;
      if (!file.type.startsWith('image/')) {
        message.error('يسمح فقط بملفات الصور');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        message.error('حجم الصورة يجب ألا يتجاوز 2 ميجابايت');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        navigate('/admin/login');
        return;
      }

      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', content);
      formData.append('categoryId', values.categoryId);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/news/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        message.success('تم تحديث الخبر بنجاح');
        navigate('/admin/news');
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'تعذر تحديث الخبر');
      }
    } catch (error) {
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !news) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>جاري تحميل الخبر...</p>
      </div>
    );
  }

  if (!news && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>الخبر غير موجود</h2>
        <Button type="primary" onClick={() => navigate('/admin/news')}>
          العودة لقائمة الأخبار
        </Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/news')}
            >
              عودة
            </Button>
            تعديل الخبر
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ title: '', content: '', categoryId: '' }}
        >
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="عنوان الخبر"
                rules={[{ required: true, message: 'يرجى إدخال عنوان الخبر' }]}
              >
                <Input placeholder="أدخل عنوان الخبر" />
              </Form.Item>

              <Form.Item
                name="categoryId"
                label="الفئة"
                rules={[{ required: true, message: 'يرجى اختيار الفئة' }]}
              >
                <Select placeholder="اختر الفئة">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="content"
                label="محتوى الخبر"
                rules={[{ required: true, message: 'يرجى إدخال محتوى الخبر' }]}
              >
                <Editor
                  licenseKey="gpl"
                  tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
                  value={content}
                  onEditorChange={(newContent) => {
                    setContent(newContent);
                    form.setFieldsValue({ content: newContent });
                  }}
                  init={{
                    plugins: [
                      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                      'insertdatetime', 'media', 'table', 'help', 'wordcount'
                    ],
                    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | removeformat',
                    height: 400,
                    language: 'ar',
                    directionality: 'rtl'
                  }}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="صورة الخبر">
                {(imagePreview || news.image) && !imageFile && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#666' }}>الصورة الحالية:</p>
                    <img
                      src={
                        imagePreview
                          ? imagePreview
                          : news.image.startsWith('http')
                          ? news.image
                          : `${process.env.REACT_APP_API_URL || ''}${news.image}`
                      }
                      alt="صورة الخبر الحالية"
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #d9d9d9'
                      }}
                    />
                  </div>
                )}

                <Upload
                  name="image"
                  listType="picture-card"
                  showUploadList={false}
                  beforeUpload={() => false}
                  onChange={handleImageChange}
                >
                  {imagePreview ? (
                    <div style={{ position: 'relative' }}>
                      <img
                        src={imagePreview}
                        alt="preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'rgba(255,255,255,0.8)',
                          border: 'none'
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>رفع صورة</div>
                    </div>
                  )}
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
            <Button type="primary" htmlType="submit" loading={loading} size="large" style={{ marginRight: '8px' }}>
              تحديث الخبر
            </Button>
            <Button onClick={() => navigate('/admin/news')} size="large">
              إلغاء
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditNews;
