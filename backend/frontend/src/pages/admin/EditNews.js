import React, { useState, useEffect, useCallback } from 'react';
import { Form, Input, Select, Button, Upload, message, Card, Row, Col, Spin } from 'antd';
import { UploadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

const { Option } = Select;
const { TextArea } = Input;

const EditNews = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [news, setNews] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  console.log('EditNews - ID:', id);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      console.log('جاري تحميل الخبر:', id);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        navigate('/admin/login');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('استجابة جلب الخبر:', res.status, res.statusText);

      if (res.ok) {
        const newsData = await res.json();
        console.log('بيانات الخبر:', newsData);

        setNews(newsData);

        if (newsData.image) {
          const imageUrl = newsData.image.startsWith('http')
            ? newsData.image
            : `${process.env.REACT_APP_API_URL}${newsData.image}`;
          setImagePreview(imageUrl);
          console.log('تم تعيين صورة الخبر الحالية:', imageUrl);
        } else {
          console.log('الخبر لا يحتوي على صورة');
        }
      } else {
        const errorData = await res.json();
        console.error('خطأ في جلب الخبر:', errorData);

        if (res.status === 404) {
          message.error('الخبر غير موجود');
        } else if (res.status === 401) {
          message.error('يجب تسجيل الدخول أولاً');
          navigate('/admin/login');
        } else {
          message.error(errorData.error || 'تعذر جلب الخبر');
        }
      }
    } catch (error) {
      console.error('خطأ في تحميل الخبر:', error);
      message.error('تعذر الاتصال بالخادم: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      loadNews();
    }
  }, [id, loadNews]);

  useEffect(() => {
    if (news && !loading) {
      form.setFieldsValue({
        title: news.title,
        summary: news.summary,
        content: news.content,
        status: news.status
      });
      setContent(news.content || '');
    }
  }, [news, loading, form]);

  if (!id) {
    console.error('لا يوجد ID للخبر');
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>خطأ في تحميل الخبر</h2>
        <p>لم يتم تحديد معرف الخبر</p>
        <Button type="primary" onClick={() => navigate('/admin/news')}>
          العودة لقائمة الأخبار
        </Button>
      </div>
    );
  }

  const handleImageChange = (info) => {
    console.log('تغيير الصورة:', info);

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
    console.log('تشغيل handleSubmit', values, imageFile);

    const editorContent = content;
    const plainTextContent = editorContent.replace(/<[^>]+>/g, '').trim();

    if (!plainTextContent) {
      message.error('يرجى كتابة محتوى الخبر');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('admin_token');

      // ✅ إرسال Multipart FormData مباشرة إلى /api/news/:id
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('summary', values.summary);
      formData.append('content', editorContent);
      formData.append('status', values.status);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/news/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        message.success('تم تحديث الخبر بنجاح!');
        navigate('/admin/news');
      } else {
        let errorMsg = 'لم نستطع تحديث الخبر.';
        try {
          const data = await res.json();
          errorMsg = data.error || data.message || errorMsg;
        } catch {}
        message.error(errorMsg);
      }
    } catch (err) {
      console.log('خطأ في fetch:', err);
      message.error('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !news) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>جاري تحميل الخبر...</p>
      </div>
    );
  }

  if (!news) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>الخبر غير موجود</h2>
        <p>لم يتم العثور على الخبر المطلوب</p>
        <Button type="primary" onClick={() => navigate('/admin/news')}>
          العودة لقائمة الأخبار
        </Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/news')}>
          العودة للأخبار
        </Button>
        <h2 style={{ margin: 0 }}>تعديل الخبر</h2>
      </div>

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item label="عنوان الخبر" name="title" rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}> 
              <Input placeholder="عنوان الخبر" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="حالة النشر" name="status"> 
              <Select placeholder="اختر حالة النشر">
                <Option value="draft">مسودة</Option>
                <Option value="published">منشور</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="ملخص الخبر" name="summary" rules={[{ required: true, message: 'يرجى إدخال الملخص' }]}> 
          <TextArea rows={3} maxLength={200} showCount />
        </Form.Item>

        <Form.Item label="محتوى الخبر" name="content" rules={[{ required: true, message: 'يرجى كتابة محتوى الخبر' }]}> 
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
                'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview', 'anchor',
                'searchreplace', 'visualblocks', 'fullscreen', 'insertdatetime', 'media', 'table',
                'help', 'wordcount', 'code', 'emoticons', 'hr', 'pagebreak', 'nonbreaking', 'directionality'
              ],
              toolbar:
                'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough forecolor backcolor | ' +
                'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
                'removeformat | link image media table | code fullscreen preview | ltr rtl | emoticons',
              paste_data_images: false,
              images_dataimg_filter: () => false,
              language: 'ar',
              directionality: 'rtl',
              height: 400,
              content_style: 'body { font-family:Tahoma,Arial,sans-serif; font-size:16px }',
              images_upload_url: `${process.env.REACT_APP_API_URL}/api/upload`,
              images_upload_handler: async (blobInfo, success, failure) => {
                const formData = new FormData();
                formData.append('file', blobInfo.blob());
                try {
                  const token = localStorage.getItem('admin_token');
                  const res = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                  });
                  const data = await res.json();
                  if (data && data.url) {
                    success(data.url);
                  } else {
                    failure('فشل رفع الصورة');
                  }
                } catch {
                  failure('فشل الاتصال بالخادم');
                }
              },
            }}
          />
        </Form.Item>

        <Form.Item label="الصورة الرئيسية">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Upload beforeUpload={() => false} onChange={handleImageChange} maxCount={1} accept="image/*" showUploadList={false}>
              <Button icon={<UploadOutlined />}>اختر صورة</Button>
            </Upload>
          </div>
          
          {/* ✅ التعديل هنا */}
          {(imagePreview || news.image) && (
            <div style={{ marginTop: '8px' }}>
              <img 
                src={
                  imagePreview
                    ? imagePreview
                    : news.image.startsWith('http')
                    ? news.image
                    : `${process.env.REACT_APP_API_URL || ''}${news.image}`
                }
                alt="معاينة الصورة"
                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }}
              />
            </div>
          )}
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} style={{ marginInlineEnd: 8 }}>
            {loading ? 'جاري التحديث...' : 'تحديث الخبر'}
          </Button>
          <Button onClick={() => navigate('/admin/news')}>إلغاء</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default EditNews;
