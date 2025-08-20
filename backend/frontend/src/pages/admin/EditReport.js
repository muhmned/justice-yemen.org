import React, { useState, useEffect } from 'react';
import { Button, Input, DatePicker, Upload, message, Form } from 'antd';
import { Editor } from '@tinymce/tinymce-react';
import { Helmet } from 'react-helmet';
import { useNavigate, useParams } from 'react-router-dom';

const EditReport = () => {
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
  const [errorMsg, setErrorMsg] = useState("");
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('admin_token');
const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          let errorText = '';
          try {
            errorText = await res.text();
          } catch (e) {}
          setError('خطأ من السيرفر: ' + (errorText || res.statusText || res.status));
          console.error('خطأ من السيرفر:', {
            status: res.status,
            statusText: res.statusText,
            response: errorText
          });
          return;
        }
        const report = await res.json();
        setTitle(report.title || '');
        setSummary(report.summary || '');
        setContent(report.content || '');
        setImageUrl(report.thumbnail || '');
        setPdfUrl(report.pdfUrl || '');
        setDate(report.publishDate ? new Date(report.publishDate) : null);
      } catch (err) {
        setError('خطأ في الاتصال بالسيرفر: ' + (err.message || 'غير معروف'));
        console.error('تفاصيل الخطأ:', err);
        if (err.stack) console.error('Stack:', err.stack);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [id]);

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
    setSubmitting(true);
    setErrorMsg("");
    if (!title || !pdfUrl || !date) {
      setErrorMsg('يرجى تعبئة جميع الحقول المطلوبة: العنوان، ملف PDF، وتاريخ النشر.');
      return;
    }
    if (!content || content.trim().length === 0) {
      setErrorMsg('يرجى كتابة نص التقرير');
      return;
    }
    if (!imageUrl) {
      setErrorMsg('يرجى رفع صورة رئيسية');
      return;
    }
    // تحقق من صحة التاريخ
    if (isNaN(new Date(date).getTime())) {
      setErrorMsg('تاريخ النشر غير صحيح.');
      return;
    }
    const reportData = {
      title,
      summary,
      content,
      pdfUrl: pdfUrl,
      thumbnail: imageUrl,
      publishDate: date ? date.toISOString() : new Date().toISOString(),
      status: 'draft'
    };
    try {
      // إصلاح مسارات الصور
      const fixedContent = content.replace(/\.\.\/uploads\//g, '/uploads/');
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/reports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...values,
          content: fixedContent,
          pdfUrl,
          thumbnail: imageUrl,
          publishDate: date ? date.toISOString() : new Date().toISOString(),
          status: 'draft'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'لم نستطع تحديث التقرير. تحقق من جميع الحقول وحاول مرة أخرى.');
        return;
      }
      message.success('تم تحديث التقرير بنجاح!');
      navigate('/admin/reports');
    } catch (err) {
      setErrorMsg('حدث خطأ في الاتصال بالخادم.');
    } finally {
      setSubmitting(false);
    }
  };

  const uploadProps = {
    name: 'file',
    action: `${process.env.REACT_APP_API_URL}/api/upload`,
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
        <title>تعديل تقرير | لوحة التحكم</title>
      </Helmet>
      <Button type="default" onClick={() => navigate('/admin/reports')} style={{ marginBottom: 16 }}>
        رجوع إلى إدارة التقارير
      </Button>
      {error && (
        <div style={{ color: 'red', marginBottom: 16 }}>
          {error === 'التقرير غير موجود' ? 'التقرير المطلوب غير موجود أو تم حذفه.' : error}
        </div>
      )}
      <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', padding: 24, borderRadius: 12, boxShadow: '0 2px 8px #eee' }}>
        <h2 style={{ marginBottom: 24 }}>تعديل تقرير</h2>
        <Form layout="vertical" form={form} onFinish={handleSubmit}>
          <Form.Item label="العنوان" required>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان التقرير" />
          </Form.Item>
          <Form.Item label="الملخص" required>
            <Input.TextArea value={summary} onChange={e => setSummary(e.target.value)} placeholder="ملخص التقرير" rows={3} />
          </Form.Item>
          <Form.Item label="تاريخ النشر" name="publishDate">
            <DatePicker
              style={{ width: '100%' }}
              placeholder="اختر تاريخ النشر"
              value={date}
              onChange={setDate}
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
              onEditorChange={setContent} // ✅ هذا السطر يحل مشكلة الترخي
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
                images_upload_handler: async (blobInfo, success, failure) => {
                  const formData = new FormData();
                  formData.append('file', blobInfo.blob());
                  try {
                    const token = localStorage.getItem('admin_token');
const res = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {                      method: 'POST',
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
                        const res = await fetch(`${process.env.REACT_APP_API_URL}/api/upload`, {            
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
                language: 'ar',
                directionality: 'rtl',
                height: 400,
                content_style: 'body { font-family:Tahoma,Arial,sans-serif; font-size:16px }',
              }}
            />
          </Form.Item>
          {errorMsg && (
            <div style={{ color: 'red', marginBottom: 16 }}>{errorMsg}</div>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={submitting} style={{ marginInlineEnd: 8 }}>
              {submitting ? 'جاري الحفظ...' : 'حفظ التعديلات'}
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

export default EditReport;
