import React, { useEffect, useState } from 'react';
import { Table, Button, message, Modal, Form, Input, Upload, Select, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, FileImageOutlined, FilePdfOutlined } from '@ant-design/icons';
import { reportsAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const uploadProps = {
  name: 'file',
  action: '/api/upload',
  showUploadList: false,
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
};

const debugTestUpload = async () => {
  // 1. Test PDF upload
  const pdfFile = new File([new Blob(["test pdf content"])], "test.pdf", { type: "application/pdf" });
  const formDataPdf = new FormData();
  formDataPdf.append('file', pdfFile);
  let pdfResult = '';
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formDataPdf
    });
    const data = await res.json();
    pdfResult = `PDF upload: status ${res.status}, response: ${JSON.stringify(data)}`;
  } catch (e) {
    pdfResult = `PDF upload error: ${e.message}`;
  }

  // 2. Test image upload
  const imgFile = new File([new Blob(["test image content"])], "test.png", { type: "image/png" });
  const formDataImg = new FormData();
  formDataImg.append('file', imgFile);
  let imgResult = '';
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: formDataImg
    });
    const data = await res.json();
    imgResult = `Image upload: status ${res.status}, response: ${JSON.stringify(data)}`;
  } catch (e) {
    imgResult = `Image upload error: ${e.message}`;
  }

  // 3. Test report save (with dummy data)
  let saveResult = '';
  try {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title: 'تقرير اختبار',
        summary: 'ملخص تجريبي',
        pdfUrl: '/uploads/test.pdf',
        thumbnail: '/uploads/test.png',
        publishDate: new Date().toISOString(),
        status: 'draft'
      })
    });
    const data = await res.json();
    saveResult = `Report save: status ${res.status}, response: ${JSON.stringify(data)}`;
  } catch (e) {
    saveResult = `Report save error: ${e.message}`;
  }

  alert(`${pdfResult}\n${imgResult}\n${saveResult}`);
};

const checkToken = () => {
  const token = localStorage.getItem('token');
  if (token) {
    alert('Token موجود في localStorage:\n' + token);
  } else {
    alert('لا يوجد Token في localStorage. يجب تسجيل الدخول من جديد.');
  }
};

const ReportsManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState({ pdf: false, image: false });
  const navigate = useNavigate();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await reportsAPI.getAll();
      setReports(res.data);
    } catch (error) {
      message.error('تعذر جلب التقارير');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingReport(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    navigate(`/admin/edit-report/${record.id}`);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      // تحويل publishDate إلى ISO string إذا كان موجودًا
      if (values.publishDate) {
        values.publishDate = new Date(values.publishDate).toISOString();
      }
      if (editingReport) {
        await reportsAPI.update(editingReport.id, values);
        message.success('تم تحديث التقرير بنجاح');
      } else {
        await reportsAPI.create(values);
        message.success('تم إضافة التقرير بنجاح');
      }
      setModalVisible(false);
      fetchReports();
    } catch (error) {
      message.error('تعذر حفظ التقرير');
    }
  };

  // رفع صورة
  const handleImageUpload = async (info) => {
    setUploading((u) => ({ ...u, image: true }));
    if (info.file.status === 'done') {
      const url = info.file.response?.url || info.file.response?.filePath || info.file.response?.path;
      if (url) {
        form.setFieldsValue({ thumbnail: url });
        message.success('تم رفع الصورة بنجاح');
      } else {
        message.error('فشل رفع الصورة');
      }
      setUploading((u) => ({ ...u, image: false }));
    } else if (info.file.status === 'error') {
      // سجل تفاصيل الخطأ في الكونسول
      if (info.file && info.file.response) {
        console.error('Upload image error:', info.file.response);
      }
      if (info.file && info.file.error) {
        console.error('Upload image error (network):', info.file.error);
      }
      message.error('فشل رفع الصورة. تحقق من الاتصال أو الصلاحيات أو راجع الكونسول لمزيد من التفاصيل.');
      setUploading((u) => ({ ...u, image: false }));
    }
  };

  // رفع PDF
  const handlePdfUpload = async (info) => {
    setUploading((u) => ({ ...u, pdf: true }));
    if (info.file.status === 'done') {
      const url = info.file.response?.url || info.file.response?.filePath || info.file.response?.path;
      if (url) {
        form.setFieldsValue({ pdfUrl: url });
        message.success('تم رفع ملف PDF بنجاح');
      } else {
        message.error('فشل رفع ملف PDF');
      }
      setUploading((u) => ({ ...u, pdf: false }));
    } else if (info.file.status === 'error') {
      // سجل تفاصيل الخطأ في الكونسول
      if (info.file && info.file.response) {
        console.error('Upload PDF error:', info.file.response);
      }
      if (info.file && info.file.error) {
        console.error('Upload PDF error (network):', info.file.error);
      }
      message.error('فشل رفع ملف PDF. تحقق من الاتصال أو الصلاحيات أو راجع الكونسول لمزيد من التفاصيل.');
      setUploading((u) => ({ ...u, pdf: false }));
    }
  };

  // دالة حذف تقرير
  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا التقرير؟')) {
      try {
        await reportsAPI.delete(id);
        message.success('تم حذف التقرير بنجاح');
        fetchReports();
      } catch (error) {
        if (error.response && error.response.status === 404) {
          message.error('التقرير غير موجود أو تم حذفه مسبقًا');
        } else {
          message.error('فشل حذف التقرير');
        }
        fetchReports(); // تحديث القائمة حتى في حالة الخطأ
      }
    }
  };

  const columns = [
    { title: 'العنوان', dataIndex: 'title', key: 'title' },
    { title: 'الملخص', dataIndex: 'summary', key: 'summary' },

    { 
      title: 'تاريخ الإنشاء', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => {
        if (!date) return '-';
        try {
          const dateObj = new Date(date);
          return dateObj.toLocaleString('ar', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        } catch (e) {
          return date;
        }
      }
    },
    { title: 'الحالة', dataIndex: 'status', key: 'status' },
    {
      title: 'إجراءات',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} style={{ marginLeft: 8 }}>
            تعديل
          </Button>
          <Button icon={<DeleteOutlined />} danger onClick={() => handleDelete(record.id)} style={{ marginRight: 8 }}>
            حذف
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ background: '#fff', padding: 13, borderRadius: 12, boxShadow: '0 3px 7px #eee' }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>إدارة التقارير</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/add-report')}>
          إضافة تقرير
        </Button>
      </div>
      <Button onClick={checkToken} style={{ marginBottom: 8, background: '#1890ff', color: '#fff' }}>فحص وجود التوكن (JWT)</Button>
      <Button onClick={debugTestUpload} style={{ marginBottom: 16, background: '#f5222d', color: '#fff' }}>تشخيص رفع الملفات وحفظ التقرير (Debug)</Button>
      <Divider />
      <Table
        columns={columns}
        dataSource={reports}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
      <Modal
        title={editingReport ? 'تعديل تقرير' : 'إضافة تقرير'}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="حفظ"
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="العنوان" rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="summary" label="الملخص">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="pdfUrl" label="ملف PDF" rules={[{ required: true, message: 'يرجى رفع ملف PDF' }]}> 
            <Upload {...uploadProps} accept="application/pdf" maxCount={1} onChange={handlePdfUpload} disabled={uploading.pdf}>
              <Button icon={<FilePdfOutlined />} loading={uploading.pdf}>رفع ملف PDF</Button>
            </Upload>
            {typeof form.getFieldValue('pdfUrl') === 'string' && (
              <div style={{ marginTop: 8, color: '#1890ff', fontSize: 13, direction: 'ltr' }}>
                {form.getFieldValue('pdfUrl').split('/').pop()}
              </div>
            )}
          </Form.Item>
          <Form.Item name="thumbnail" label="الصورة (اختياري)">
            <Upload {...uploadProps} accept="image/*" maxCount={1} onChange={handleImageUpload} disabled={uploading.image}>
              <Button icon={<FileImageOutlined />} loading={uploading.image}>رفع صورة</Button>
            </Upload>
            {typeof form.getFieldValue('thumbnail') === 'string' && (
              <div style={{ marginTop: 8, color: '#1890ff', fontSize: 13, direction: 'ltr' }}>
                <img src={form.getFieldValue('thumbnail')} alt="معاينة" style={{ maxWidth: 80, maxHeight: 80, display: 'block', marginBottom: 4 }} />
                {form.getFieldValue('thumbnail').split('/').pop()}
              </div>
            )}
          </Form.Item>
          <Form.Item name="publishDate" label="تاريخ النشر">
            <Input type="date" />
          </Form.Item>
          <Form.Item name="status" label="الحالة" rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}> 
            <Select>
              <Select.Option value="draft">مسودة</Select.Option>
              <Select.Option value="published">منشور</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ReportsManagement; 