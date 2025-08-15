import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Upload, message, Form, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Helmet } from 'react-helmet';
import { Editor } from '@tinymce/tinymce-react';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const AddArticle = () => {
  const [sections, setSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(true);
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
fetch(`${process.env.REACT_APP_API_URL || ''}/api/sections/active`)
      .then(res => res.json())
      .then(data => {
        setSections(Array.isArray(data) ? data : []);
        setLoadingSections(false);
      })
      .catch(() => {
        setSections([]);
        setLoadingSections(false);
      });
  }, []);

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
    console.log('تشغيل handleSubmit', values, content, image);

    // تحقق من وجود محتوى فعلي
    if (!content || content.replace(/<[^>]+>/g, '').trim().length === 0) {
      message.error('يرجى كتابة محتوى المقال');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('sectionId', values.sectionId);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('admin_token');
      console.log('سيتم إرسال الطلب الآن');
     const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/articles`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      console.log('تم إرسال الطلب، status:', res.status);
      if (res.ok) {
        message.success('تم نشر المقال بنجاح!');
        form.resetFields();
        setContent('');
        setImage(null);
      } else {
        let errorMsg = 'لم نستطع نشر المقال.';
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
        <title>إضافة مقال | لوحة التحكم</title>
      </Helmet>
      <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
        <h2 style={{ marginBottom: 24 }}>إضافة مقال جديد</h2>
        {loadingSections ? <Spin /> : (
          <>
            <Form layout="vertical" form={form} onFinish={(values) => {console.log('onFinish', values, content); handleSubmit(values);}}>
              <Form.Item label="عنوان المقال" name="title" rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}> 
                <Input placeholder="عنوان المقال" />
              </Form.Item>
              <Form.Item label="القسم" name="sectionId" rules={[{ required: true, message: 'يرجى اختيار القسم' }]}> 
                <Select placeholder="اختر القسم">
                  {sections.map(section => (
                    <Option key={section.id} value={section.id}>{section.name}</Option>
                  ))}
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
                        maxWidth: '200px', 
                        maxHeight: '150px', 
                        objectFit: 'cover',
                        borderRadius: '4px',
                        border: '1px solid #d9d9d9'
                      }} 
                    />
                  </div>
                )}
                <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  الصورة اختيارية. الحد الأقصى 2 ميجابايت. الأنواع المدعومة: jpg, png, gif, webp
                </p>
              </Form.Item>
              <Form.Item label="محتوى المقال">
                <Editor
                 tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
                  value={content}
                  onEditorChange={(newContent) => {
                    setContent(newContent);
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
                    images_upload_url: `${process.env.REACT_APP_API_URL || ''}/api/upload`,                    images_upload_handler: async (blobInfo, success, failure) => {
                      try {
                        const formData = new FormData();
                        formData.append('file', blobInfo.blob());
                        const token = localStorage.getItem('admin_token');
                        const res = await fetch('/api/upload', {
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
                          try {
                            const file = this.files[0];
                            const formData = new FormData();
                            formData.append('file', file);
                            const token = localStorage.getItem('admin_token');
                          const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/upload`,{
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
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={submitting} block>
                  نشر المقال
                </Button>
              </Form.Item>
            </Form>
            <div style={{ marginTop: 24, textAlign: 'left' }}>
              <Button onClick={() => navigate(-1)} type="default">عودة للخلف</Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AddArticle;
