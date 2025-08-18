import React, { useState, useEffect } from 'react';
import { Button, Input, DatePicker, Upload, message, Form } from 'antd';
import { Editor } from '@tinymce/tinymce-react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';

const AddReport = () => {
  const [form] = Form.useForm();
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState({ pdf: false, image: false });
  const [summary, setSummary] = useState("");
  const [title, setTitle] = useState("");
  // أضف حالة للرسالة
  const [errorMsg, setErrorMsg] = useState("");
  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    // تحقق إذا كان هناك تقرير للتعديل
    const editing = localStorage.getItem('editingReport');
    if (editing) {
      try {
        const report = JSON.parse(editing);
        form.setFieldsValue({
          title: report.title || '',
          summary: report.summary || '',
          publishDate: report.publishDate ? new Date(report.publishDate) : null,
        });
        setContent(report.content || '');
        setImageUrl(report.thumbnail || '');
        setPdfUrl(report.pdfUrl || '');
        setDate(report.publishDate ? new Date(report.publishDate) : null);
        setIsEdit(true);
      } catch (e) {
        console.error('خطأ في قراءة بيانات التعديل:', e);
      }
      localStorage.removeItem('editingReport');
    } else {
      setIsEdit(false);
    }
  }, [form]);

  // رفع صورة مباشرة
  const handleImageUpload = async (info) => {
    setUploading((u) => ({ ...u, image: true }));
    if (info.file.status === 'done') {
      const url = info.file.response?.url || info.file.response?.filePath || info.file.response?.path;
      if (url) {
        setImageUrl(url);
        message.success('تم رفع الصورة بنجاح');
      } else {
        message.error('فشل رفع الصورة');
      }
      setUploading((u) => ({ ...u, image: false }));
    } else if (info.file.status === 'error') {
      message.error('فشل رفع الصورة. تحقق من الاتصال أو الصلاحيات.');
      setUploading((u) => ({ ...u, image: false }));
    }
  };

  // رفع PDF مباشرة
  const handlePdfUpload = async (info) => {
    setUploading((u) => ({ ...u, pdf: true }));
    if (info.file.status === 'done') {
      const url = info.file.response?.url || info.file.response?.filePath || info.file.response?.path;
      if (url) {
        setPdfUrl(url);
        message.success('تم رفع ملف PDF بنجاح');
      } else {
        message.error('فشل رفع ملف PDF');
      }
      setUploading((u) => ({ ...u, pdf: false }));
    } else if (info.file.status === 'error') {
      message.error('فشل رفع ملف PDF. تحقق من الاتصال أو الصلاحيات.');
      setUploading((u) => ({ ...u, pdf: false }));
    }
  };

  const handleSubmit = async (values) => {
    if (!content || content.trim().length === 0) {
      message.error('يرجى كتابة نص التقرير');
      return;
    }
    if (!imageUrl) {
      message.error('يرجى رفع صورة رئيسية');
      return;
    }
    if (!pdfUrl) {
      message.error('يرجى رفع ملف PDF');
      return;
    }
    setSubmitting(true);
    setErrorMsg("");
    // تحقق من صحة التاريخ
    if (!values.publishDate || isNaN(new Date(values.publishDate).getTime())) {
      setErrorMsg('تاريخ النشر غير صحيح.');
      return;
    }
    // جهز البيانات
    const fixedContent = content.replace(/\.\.\/uploads\//g, '/uploads/');
    const reportData = {
      title: values.title,
      summary: values.summary,
      content: fixedContent,
      pdfUrl: pdfUrl,
      thumbnail: imageUrl,
      publishDate: values.publishDate ? values.publishDate.toISOString() : new Date().toISOString(),
      status: 'draft'
    };
    try {
      const token = localStorage.getItem('admin_token');
     const res = await fetch(`${process.env.REACT_APP_API_URL || ''}/api/reports`,{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(reportData)
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'لم نستطع إضافة التقرير. تحقق من جميع الحقول وحاول مرة أخرى.');
        return;
      }
      message.success('تم إضافة التقرير بنجاح!');
      form.resetFields();
      setContent('');
      setImageUrl('');
      setPdfUrl('');
      setDate(null);
      navigate('/admin/reports');
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProps = {
    name: 'file',
action: `${process.env.REACT_APP_API_URL || ''}/api/upload`,    
     showUploadList: false,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
      'X-Requested-With': 'XMLHttpRequest'
    },
    beforeUpload: (file) => {
      const token = localStorage.getItem('admin_token');
      if (!token) {
        message.error('يرجى تسجيل الدخول أولاً');
        return false;
      }
      return true;
    },
    onError: (error) => {
      console.error('خطأ في رفع الملف:', error);
      message.error('فشل رفع الملف. تحقق من الاتصال أو الصلاحيات.');
    }
  };

  return (
    <>
      <Helmet>
        <title>إضافة تقرير | لوحة التحكم</title>
      </Helmet>
      <Button type="default" onClick={() => navigate('/admin/reports')} style={{ marginBottom: 16 }}>
        رجوع إلى إدارة التقارير
      </Button>
      <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
        <h2 style={{ marginBottom: 24 }}>{isEdit ? 'تعديل تقرير' : 'إضافة تقرير جديد'}</h2>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item label="العنوان" name="title" rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}>
            <Input placeholder="عنوان التقرير" />
          </Form.Item>
          <Form.Item label="الملخص" name="summary" rules={[{ required: true, message: 'يرجى إدخال الملخص' }]}>
            <Input.TextArea placeholder="ملخص التقرير" rows={3} />
          </Form.Item>
          <Form.Item label="تاريخ النشر" name="publishDate" rules={[{ required: true, message: 'يرجى اختيار تاريخ النشر' }]}>
            <DatePicker
              style={{ width: '100%' }}
              placeholder="اختر تاريخ النشر"
              format="YYYY-MM-DD"
              allowClear
            />
          </Form.Item>
          <Form.Item label="الصورة الرئيسية" required>
            <Upload
              {...uploadProps}
              accept="image/*"
              maxCount={1}
              onChange={handleImageUpload}
              disabled={uploading.image}
            >
              <Button type="primary" loading={uploading.image}>رفع صورة</Button>
            </Upload>
            {imageUrl && (
              <div style={{ marginTop: '8px' }}>
                <img
                  src={imageUrl}
                  alt="معاينة الصورة"
                  style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
                <Button type="text" danger size="small" onClick={() => setImageUrl('')}>
                  إزالة
                </Button>
              </div>
            )}
          </Form.Item>
          <Form.Item label="ملف PDF" required>
            <Upload
              {...uploadProps}
              accept="application/pdf"
              maxCount={1}
              onChange={handlePdfUpload}
              disabled={uploading.pdf}
            >
              <Button type="primary" loading={uploading.pdf}>رفع ملف PDF</Button>
            </Upload>
            {pdfUrl && (
              <div style={{ marginTop: '8px' }}>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff', fontWeight: 'bold', fontSize: 15 }}>
                  {pdfUrl.split('/').pop()}
                </a>
                <Button type="text" danger size="small" onClick={() => setPdfUrl('')}>
                  إزالة
                </Button>
              </div>
            )}
          </Form.Item>
          <Form.Item label="نص التقرير" required>
  <Editor
    licenseKey="gpl"   // ✅ هذا السطر يحل مشكلة الترخيص
    tinymceScriptSrc={process.env.PUBLIC_URL + '/tinymce/tinymce.min.js'}
    value={content}
    onEditorChange={setContent}
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
          {errorMsg && (
            <div style={{ color: 'red', marginBottom: 16 }}>{errorMsg}</div>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ marginInlineEnd: 8 }}>
              {submitting ? (isEdit ? 'جاري الحفظ...' : 'جاري الإضافة...') : (isEdit ? 'حفظ التعديلات' : 'إضافة التقرير')}
            </Button>
            <Button onClick={() => navigate('/admin/reports')}>
              إلغاء
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default AddReport;
