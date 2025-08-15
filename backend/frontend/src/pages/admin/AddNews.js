import React, { useState, useCallback } from 'react';
import { Button, Input, Select, Upload, message, Form } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

const { Option } = Select;
const { TextArea } = Input;

const AddNews = () => {
  const [form] = Form.useForm();
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (info) => {
    console.log('تغيير الصورة:', info);
    
    if (info.file && info.file.originFileObj) {
      const file = info.file.originFileObj;
      console.log('تم اختيار صورة جديدة:', file.name, 'حجم:', file.size);
      
      // التحقق من نوع الملف
      if (!file.type.startsWith('image/')) {
        message.error('يسمح فقط بملفات الصور');
        return;
      }
      
      setImage(file);
      console.log('تم تحديث الصورة بنجاح');
    } else if (info.fileList && info.fileList.length > 0) {
      const file = info.fileList[0].originFileObj;
      if (file) {
        console.log('تم اختيار صورة من fileList:', file.name);
        
        // التحقق من نوع الملف
        if (!file.type.startsWith('image/')) {
          message.error('يسمح فقط بملفات الصور');
          return;
        }
        
        setImage(file);
        console.log('تم تحديث الصورة من fileList بنجاح');
      }
    }
  };

  const handleSubmit = async (values) => {
    console.log('تشغيل handleSubmit', values, image);

    // استخلاص المحتوى النصي من المحرر
    const plainTextContent = content.replace(/<[^>]+>/g, '').trim();

    // تحقق من وجود محتوى فعلي
    if (!plainTextContent) {
      message.error('يرجى كتابة محتوى الخبر');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('summary', values.summary);
    formData.append('content', content); // إرسال المحتوى الكامل (HTML)
    formData.append('status', values.status || 'draft');
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('admin_token');
      console.log('سيتم إرسال الطلب الآن');
const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/news`, {
          method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      console.log('تم إرسال الطلب، status:', res.status);
      if (res.ok) {
        message.success('تم نشر الخبر بنجاح!');
        form.resetFields();
        setImage(null);
        navigate('/admin/news');
      } else {
        let errorMsg = 'لم نستطع نشر الخبر.';
        try {
          const data = await res.json();
          if (data && data.error) {
            errorMsg = data.error;
            console.log('خطأ من السيرفر:', data);
          } else if (data && data.message) {
            errorMsg = data.message;
            console.log('رسالة من السيرفر:', data);
          }
        } catch (e) {
          console.log('خطأ في قراءة رد السيرفر:', e);
        }
        
        // معالجة أخطاء محددة
        if (errorMsg.includes('حجم الملف')) {
          message.error('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت');
        } else if (errorMsg.includes('ملفات الصور')) {
          message.error('يسمح فقط بملفات الصور (jpg, png, gif, webp)');
        } else if (errorMsg.includes('نوع الصورة')) {
          message.error('نوع الصورة غير مدعوم. يسمح فقط بـ jpg, png, webp');
        } else if (errorMsg.includes('حجم الصورة')) {
          message.error('حجم الصورة كبير جداً. الحد الأقصى 2 ميجابايت');
        } else {
          message.error(errorMsg);
        }
      }
    } catch (err) {
      console.log('خطأ في fetch:', err);
      message.error('تعذر الاتصال بالخادم');
    } finally {
      setSubmitting(false);
      console.log('انتهت عملية النشر');
    }
  };

  return (
    <>
      <Helmet>
        <title>إضافة خبر | لوحة التحكم</title>
      </Helmet>
      <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
        <h2 style={{ marginBottom: 24 }}>إضافة خبر جديد</h2>
        
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item label="عنوان الخبر" name="title" rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}> 
            <Input placeholder="عنوان الخبر" />
          </Form.Item>
          
          <Form.Item label="ملخص الخبر" name="summary" rules={[{ required: true, message: 'يرجى إدخال الملخص' }]}> 
            <TextArea 
              placeholder="ملخص مختصر للخبر" 
              rows={3}
              maxLength={200}
              showCount
            />
          </Form.Item>
          
          <Form.Item label="محتوى الخبر" name="content" rules={[{ required: true, message: 'يرجى كتابة محتوى الخبر' }]} validateTrigger="onEditorChange">
            <Editor
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
                paste_as_text: false,
                paste_enable_default_filters: true,
                paste_remove_styles_if_webkit: true,
                paste_retain_style_properties: 'color font-size font-family',
                images_upload_url: `${process.env.REACT_APP_API_URL || ''}/api/upload`,
                  images_upload_handler: async (blobInfo, success, failure) => {
                  const formData = new FormData();
                  formData.append('file', blobInfo.blob());
                  try {
                    const token = localStorage.getItem('admin_token');
                    const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/upload`, {
                      method: 'POST',
                      headers: { Authorization: `Bearer ${token}` },
                      body: formData
                    });
                    const data = await res.json();
                    if (data && data.url) {
                      let url = data.url.replace(/^\.\.\//, '/');
                      success(url);
                    } else {
                      failure('فشل رفع الصورة');
                    }
                  } catch (e) {
                    failure('فشل الاتصال بالخادم');
                  }
                },
                file_picker_callback: function (callback, value, meta) {
                  if (meta.filetype === 'image') {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.onchange = async function () {
                      const file = this.files[0];
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        const token = localStorage.getItem('admin_token');
                        const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/upload`, {
                          method: 'POST',
                          headers: { Authorization: `Bearer ${token}` },
                          body: formData
                        });
                        const data = await res.json();
                        if (data && data.url) {
                          let url = data.url.replace(/^\.\.\//, '/');
                          callback(url, { title: file.name });
                        } else {
                          alert('فشل رفع الصورة');
                        }
                      } catch (e) {
                        alert('فشل الاتصال بالخادم');
                      }
                    };
                    input.click();
                  }
                },
              }}
            />
          </Form.Item>
          
          <Form.Item label="حالة النشر" name="status" initialValue="draft"> 
            <Select placeholder="اختر حالة النشر">
              <Option value="draft">مسودة</Option>
              <Option value="published">منشور</Option>
            </Select>
          </Form.Item>
          
          <Form.Item label="الصورة الرئيسية">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Upload 
                beforeUpload={() => false}
                onChange={handleImageChange}
                maxCount={1}
                accept="image/*"
                showUploadList={false}
              >
                <Button icon={<UploadOutlined />}>اختر صورة</Button>
              </Upload>
              {image && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#1890ff', fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 15 }}>
                    ✓ {image.name}
                  </span>
                  <Button 
                    type="text" 
                    danger 
                    size="small"
                    onClick={() => {
                      setImage(null);
                      console.log('تم إزالة الصورة');
                    }}
                  >
                    إزالة
                  </Button>
                </div>
              )}
            </div>
            {image && (
              <div style={{ marginTop: '8px' }}>
                <img 
                  src={URL.createObjectURL(image)} 
                  alt="معاينة الصورة"
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: 200, 
                    objectFit: 'cover',
                    borderRadius: 8,
                    border: '1px solid #d9d9d9'
                  }} 
                />
              </div>
            )}
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ marginInlineEnd: 8 }}>
              {submitting ? 'جاري النشر...' : 'نشر الخبر'}
            </Button>
            <Button onClick={() => navigate('/admin/news')}>
              إلغاء
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default AddNews;
