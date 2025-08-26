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



  const handleSubmit = async (values) => {
    const editorContent = content;
    const plainTextContent = editorContent.replace(/<[^>]+>/g, '').trim();

    if (!plainTextContent) {
      message.error('يرجى كتابة محتوى المقال');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');
      
      // إنشاء FormData لإرسال البيانات والملفات
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', editorContent);
      formData.append('sectionId', values.sectionId);
      
      // إذا كان هناك صورة جديدة، أضفها للـ FormData
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview && !imagePreview.startsWith('blob:')) {
        // إذا كانت الصورة رابط موجود، أضفها كـ URL
        formData.append('image', imagePreview);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // لا تقم بتحديد Content-Type يدوياً حتى يُضاف boundary تلقائياً
        },
        body: formData,
      });

      if (res.ok) {
        message.success('تم تحديث المقال بنجاح!');
        navigate('/admin/articles');
      } else {
        let errorMsg = 'لم نستطع تحديث المقال.';
        try {
          const data = await res.json();
          errorMsg = data.error || data.message || errorMsg;
        } catch {}
        message.error(errorMsg);
      }
    } catch (err) {
      message.error('تعذر الاتصال بالخادم');
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
                  beforeUpload={(file) => {
                    // التحقق من نوع الملف
                    if (!file.type.startsWith('image/')) {
                      message.error('يسمح فقط بملفات الصور');
                      return false;
                    }
                    
                    // التحقق من حجم الملف (5MB)
                    if (file.size > 5 * 1024 * 1024) {
                      message.error('حجم الصورة يجب ألا يتجاوز 5 ميجابايت');
                      return false;
                    }
                    
                    // حفظ الملف وعرض الصورة
                    setImageFile(file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      setImagePreview(e.target.result);
                    };
                    reader.readAsDataURL(file);
                    
                    return false; // منع الرفع التلقائي
                  }}
                  onChange={(info) => {
                    if (info.file.status === 'removed') {
                      setImagePreview('');
                      setImageFile(null);
                    }
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div>
                      <UploadOutlined />
                      <div style={{ marginTop: 8 }}>رفع صورة</div>
                    </div>
                  )}
                </Upload>
                {imagePreview && (
                  <Button
                    type="text"
                    danger
                    size="small"
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                  >
                    إزالة الصورة
                  </Button>
                )}
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
