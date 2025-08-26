import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Upload, message, Card, Row, Col, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

const { Option } = Select;
const { TextArea } = Input;

const EditArticle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [article, setArticle] = useState(null);
  const [sections, setSections] = useState([]);
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

  const loadArticle = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        navigate('/admin/login');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/articles/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const articleData = await res.json();
        setArticle(articleData);
        setContent(cleanContent(articleData.content || ''));

        if (articleData.image) {
          const imageUrl = articleData.image.startsWith('http')
            ? articleData.image
            : `${process.env.REACT_APP_API_URL || ''}${articleData.image}`;
          setImagePreview(imageUrl);
        }
      } else {
        message.error('تعذر جلب المقال');
      }
    } catch (error) {
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const fetchSections = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        navigate('/admin/login');
        return;
      }
      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/sections/active`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setSections(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchSections();
      loadArticle();
    }
  }, [id, loadArticle]);

  useEffect(() => {
    if (article && !loading) {
      form.setFieldsValue({
        title: article.title,
        content: cleanContent(article.content || ''),
        sectionId: article.sectionId
      });
    }
  }, [article, loading, form]);

  const handleImageChange = (info) => {
    if (info.file && info.file.originFileObj) {
      const file = info.file.originFileObj;
      if (!file.type.startsWith('image/')) {
        message.error('يسمح فقط بملفات الصور');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        message.error('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
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
      formData.append('sectionId', values.sectionId);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview && !imagePreview.startsWith('blob:')) {
        // إذا كانت الصورة رابط موجود، أضفها كـ URL
        formData.append('image', imagePreview);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/articles/${id}`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${token}`,
          // لا تقم بتحديد Content-Type يدوياً حتى يُضاف boundary تلقائياً
        },
        body: formData
      });

      if (res.ok) {
        message.success('تم تحديث المقال بنجاح');
        navigate('/admin/articles');
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'تعذر تحديث المقال');
      }
    } catch (error) {
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !article) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>جاري تحميل المقال...</p>
      </div>
    );
  }

  if (!article && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>المقال غير موجود</h2>
        <Button type="primary" onClick={() => navigate('/admin/articles')}>
          العودة لقائمة المقالات
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
              onClick={() => navigate('/admin/articles')}
            >
              عودة
            </Button>
            تعديل المقال
          </div>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ title: '', content: '', sectionId: '' }}
        >
          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                name="title"
                label="عنوان المقال"
                rules={[{ required: true, message: 'يرجى إدخال عنوان المقال' }]}
              >
                <Input placeholder="أدخل عنوان المقال" />
              </Form.Item>

              <Form.Item
                name="sectionId"
                label="القسم"
                rules={[{ required: true, message: 'يرجى اختيار القسم' }]}
              >
                <Select placeholder="اختر القسم">
                  {sections.map(section => (
                    <Option key={section.id} value={section.id}>
                      {section.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="content"
                label="محتوى المقال"
                rules={[{ required: true, message: 'يرجى إدخال محتوى المقال' }]}
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
              <Form.Item label="صورة المقال">
                {(imagePreview || article.image) && !imageFile && (
                  <div style={{ marginBottom: '8px' }}>
                    <p style={{ fontSize: '12px', color: '#666' }}>الصورة الحالية:</p>
                    <img
                      src={
                        imagePreview
                          ? imagePreview
                          : article.image.startsWith('http')
                          ? article.image
                          : `${process.env.REACT_APP_API_URL || ''}${article.image}`
                      }
                      alt="صورة المقال الحالية"
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
              تحديث المقال
            </Button>
            <Button onClick={() => navigate('/admin/articles')} size="large">
              إلغاء
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditArticle;
