import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Typography, Spin, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function AboutEdit() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [aboutData, setAboutData] = useState({ title: '', content: '', image: '', vision: '', mission: '', strategic_goals: '', values: '', org_structure: '', work_fields: '' });
  const [pendingImage, setPendingImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/basic-info/about');
      if (!res.ok) throw new Error('فشل في جلب البيانات');
      const data = await res.json();
      setAboutData({
        title: data.title || '',
        content: data.content || '',
        image: data.image || '',
        vision: data.vision || '',
        mission: data.mission || '',
        strategic_goals: data.strategic_goals || '',
        values: data.values || '',
        org_structure: data.org_structure || '',
        work_fields: data.work_fields || ''
      });
      form.setFieldsValue({
        title: data.title || '',
        content: data.content || '',
        vision: data.vision || '',
        mission: data.mission || '',
        strategic_goals: data.strategic_goals || '',
        values: data.values || '',
        org_structure: data.org_structure || '',
        work_fields: data.work_fields || ''
      });
      message.success('تم جلب بيانات من نحن بنجاح');
    } catch (e) {
      console.error('خطأ في جلب البيانات:', e);
      message.error('تعذر جلب بيانات من نحن');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    console.log('تم الضغط على زر الحفظ');
    setSaving(true);
    try {
      const values = await form.validateFields();
      console.log('بيانات الحفظ:', values);
      
      const res = await fetch('http://localhost:5000/api/basic-info/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: values.title,
          content: values.content,
          image: aboutData.image,
          vision: values.vision,
          mission: values.mission,
          strategic_goals: values.strategic_goals,
          values: values.values,
          org_structure: values.org_structure,
          work_fields: values.work_fields
        })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'خطأ في حفظ البيانات');
      }
      
      const savedData = await res.json();
      setAboutData(savedData);
      message.success('تم حفظ بيانات من نحن بنجاح!');
      console.log('تم الحفظ بنجاح:', savedData);
    } catch (e) {
      console.error('خطأ في الحفظ:', e);
      message.error(e.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = info => {
    const file = info.file.originFileObj;
    if (!file) return;
    setPendingImage(file);
    setPreviewVisible(true);
  };

  const handleUploadImage = async () => {
    if (!pendingImage) return;
    setSaving(true);
    const formData = new FormData();
    formData.append('about_image', pendingImage);
    try {
      const res = await fetch('http://localhost:5000/api/settings/about-image', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'خطأ في رفع الصورة');
      setAboutData(prev => ({ ...prev, image: data.about_image }));
      setPreviewVisible(false);
      setPendingImage(null);
      message.success('تم رفع الصورة بنجاح!');
    } catch (e) {
      console.error('خطأ في رفع الصورة:', e);
      message.error(e.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px' }}>
      <Card title={<Title level={3}>تعديل صفحة من نحن</Title>}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '20px' }}>جاري تحميل البيانات...</p>
          </div>
        ) : (
          <>
            <div style={{textAlign:'center',fontWeight:'bold',fontSize:'20px',marginBottom:'16px'}}>من نحن</div>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item name="title" label="العنوان" rules={[]} initialValue={aboutData.title}> 
                <Input placeholder="أدخل عنوان الصفحة" />
              </Form.Item>
              <Form.Item name="content" label="محتوى الصفحة" rules={[]} initialValue={aboutData.content}>
                <Input.TextArea placeholder="أدخل محتوى صفحة من نحن" rows={10} style={{ marginBottom: 24 }} />
              </Form.Item>
              
              <Form.Item name="vision" label="الرؤية" rules={[]} initialValue={aboutData.vision}>
                <Input.TextArea placeholder="أدخل الرؤية" rows={3} />
              </Form.Item>
              <Form.Item name="mission" label="الرسالة" rules={[]} initialValue={aboutData.mission}>
                <Input.TextArea placeholder="أدخل الرسالة" rows={3} />
              </Form.Item>
              <Form.Item name="strategic_goals" label="الأهداف الاستراتيجية" rules={[]} initialValue={aboutData.strategic_goals}>
                <Input.TextArea placeholder="أدخل الأهداف الاستراتيجية" rows={3} />
              </Form.Item>
              <Form.Item name="values" label="القيم والمبادئ" rules={[]} initialValue={aboutData.values}>
                <Input.TextArea placeholder="أدخل القيم والمبادئ" rows={3} />
              </Form.Item>
              <Form.Item name="org_structure" label="الهيكل التنظيمي" rules={[]} initialValue={aboutData.org_structure}>
                <Input.TextArea placeholder="أدخل الهيكل التنظيمي" rows={3} />
              </Form.Item>
              <Form.Item name="work_fields" label="مجالات العمل" rules={[]} initialValue={aboutData.work_fields}>
                <Input.TextArea placeholder="أدخل مجالات العمل" rows={3} />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  size="large"
                  loading={saving}
                  block
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ البيانات'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ marginTop: 32, padding: '20px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
              <h4>صورة الصفحة</h4>
              <div style={{ marginBottom: 16 }}>
                {aboutData.image ? (
                  <div>
                    <p>الصورة الحالية:</p>
                    <img 
                      src={aboutData.image} 
                      alt="صورة من نحن" 
                      style={{ maxWidth: 200, borderRadius: 8, border: '1px solid #d9d9d9' }} 
                    />
                  </div>
                ) : (
                  <p style={{ color: '#999' }}>لا توجد صورة حالياً</p>
                )}
              </div>
              
              <Upload 
                showUploadList={false} 
                beforeUpload={() => false} 
                onChange={handleImageChange}
              >
                <Button icon={<UploadOutlined />} size="large">
                  {aboutData.image ? 'تغيير الصورة' : 'إضافة صورة'}
                </Button>
              </Upload>
            </div>
          </>
        )}
        
        <Modal 
          open={previewVisible} 
          onCancel={() => setPreviewVisible(false)} 
          onOk={handleUploadImage} 
          okText="رفع الصورة" 
          cancelText="إلغاء" 
          title="معاينة الصورة"
          confirmLoading={saving}
        >
          {pendingImage && (
            <div style={{ textAlign: 'center' }}>
              <img 
                src={URL.createObjectURL(pendingImage)} 
                alt="معاينة" 
                style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px' }} 
              />
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
} 