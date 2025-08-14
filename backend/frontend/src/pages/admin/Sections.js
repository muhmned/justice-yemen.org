import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Popconfirm,
  Tooltip,
  Typography
} from 'antd';
import {
  FolderOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Helmet } from 'react-helmet';

const { Title, Text } = Typography;
const { TextArea } = Input;

const Sections = () => {
  const { hasPermission } = useAuth();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    articlesCount: 0
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('admin_token');

      if (!token) {
        message.error('يجب تسجيل الدخول أولاً');
        return;
      }

      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/sections`, {
  headers: { 'Authorization': `Bearer ${token}` }
});

if (!res.ok) {
  const text = await res.text(); // نص الصفحة عند الخطأ
  console.error('Fetch failed, response:', text);
  throw new Error(`HTTP error! status: ${res.status}`);
}

      if (res.ok) {
        const sectionsData = await res.json();
        setSections(sectionsData);

        // حساب الإحصائيات
        const total = sectionsData.length;
        const active = sectionsData.filter(s => s.status === 'active').length;
        const inactive = total - active;
        const articlesCount = sectionsData.reduce((sum, section) => sum + (section.articlesCount || 0), 0);

        setStats({ total, active, inactive, articlesCount });
      } else {
        // بيانات تجريبية للعرض
        const mockSections = [
       
        ];

        setSections(mockSections);
        setStats({
          total: mockSections.length,
          active: mockSections.filter(s => s.status === 'active').length,
          inactive: mockSections.filter(s => s.status === 'inactive').length,
          articlesCount: mockSections.reduce((sum, section) => sum + section.articlesCount, 0)
        });
      }
    } catch (error) {
      console.error('خطأ في جلب الأقسام:', error);
      message.error('تعذر الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = () => {
    setEditingSection(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    form.setFieldsValue({
      name: section.name,
      description: section.description,
      slug: section.slug,
      status: section.status
    });
    setModalVisible(true);
  };

  const handleDeleteSection = async (sectionId) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/sections/${sectionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        message.success('تم حذف القسم بنجاح');
        fetchSections();
      } else {
        message.error('تعذر حذف القسم');
      }
    } catch (error) {
      console.error('خطأ في حذف القسم:', error);
      message.error('تعذر الاتصال بالخادم');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('admin_token');
      const url = editingSection
        ? `${process.env.REACT_APP_API_URL}/api/sections/${editingSection.id}`
        : `${process.env.REACT_APP_API_URL}/api/sections`;
      const method = editingSection ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (res.ok) {
        message.success(editingSection ? 'تم تحديث القسم بنجاح' : 'تم إضافة القسم بنجاح');
        setModalVisible(false);
        fetchSections();
      } else {
        const errorData = await res.json();
        message.error(errorData.error || 'تعذر حفظ القسم');
      }
    } catch (error) {
      console.error('خطأ في حفظ القسم:', error);
      message.error('تعذر الاتصال بالخادم');
    }
  };

  const columns = [
    {
      title: 'اسم القسم',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderOutlined />
          <span style={{ fontWeight: 'bold' }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'الرابط',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <Text code>{slug}</Text>
      ),
    },
    {
      title: 'عدد المقالات',
      dataIndex: 'articlesCount',
      key: 'articlesCount',
      render: (count) => (
        <Tag color="blue" icon={<FileTextOutlined />}>
          {count} مقال
        </Tag>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'نشط' : 'غير نشط'}
        </Tag>
      ),
    },
    {
      title: 'تاريخ الإنشاء',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('ar-SA'),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {hasPermission('edit_section') && (
            <Tooltip title="تعديل">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEditSection(record)}
              />
            </Tooltip>
          )}
          {hasPermission('delete_section') && (
            <Popconfirm
              title="هل أنت متأكد من حذف هذا القسم؟"
              description="سيتم حذف جميع المقالات المرتبطة بهذا القسم"
              onConfirm={() => handleDeleteSection(record.id)}
              okText="نعم"
              cancelText="لا"
            >
              <Tooltip title="حذف">
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>إدارة الأقسام | لوحة التحكم</title>
      </Helmet>

      <div style={{ padding: '24px' }}>
        {/* العنوان وأزرار التحكم */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <Title level={2} style={{ margin: 0, color: '#1e3c72' }}>
              إدارة الأقسام
            </Title>
            <Text type="secondary">
              إدارة أقسام الموقع وتنظيم المحتوى
            </Text>
          </div>
          <Space>
          {/* <Button
              icon={<ReloadOutlined />}
              onClick={fetchSections}
            >
              تحديث
            </Button>*/}
            {hasPermission('add_section') && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddSection}
              >
                إضافة قسم
              </Button>
            )}
          </Space>
        </div>

        {/* الإحصائيات */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي الأقسام"
                value={stats.total}
                prefix={<FolderOutlined />}
                valueStyle={{ color: '#3498db' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="الأقسام النشطة"
                value={stats.active}
                prefix={<FolderOutlined />}
                valueStyle={{ color: '#27ae60' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="الأقسام غير النشطة"
                value={stats.inactive}
                prefix={<FolderOutlined />}
                valueStyle={{ color: '#e74c3c' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="إجمالي المقالات"
                value={stats.articlesCount}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#f39c12' }}
              />
            </Card>
          </Col>
        </Row>

        {/* جدول الأقسام */}
     <Card>
  <Table
    columns={columns}
    dataSource={sections}
    rowKey="id"
    loading={loading}
    scroll={{ x: 'max-content' }} // 🔥 هذه تضيف تمرير أفقي
    pagination={{
      pageSize: 5,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total, range) =>
        `${range[0]}-${range[1]} من ${total} قسم`
    }}
  />
</Card>

        {/* Modal إضافة/تعديل قسم */}
        <Modal
          title={editingSection ? 'تعديل القسم' : 'إضافة قسم جديد'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="name"
                  label="اسم القسم"
                  rules={[
                    { required: true, message: 'يرجى إدخال اسم القسم' },
                    { min: 2, message: 'يجب أن يكون اسم القسم حرفين على الأقل' }
                  ]}
                >
                  <Input placeholder="أدخل اسم القسم" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="slug"
                  label="الرابط المختصر"
                  rules={[
                    { required: true, message: 'يرجى إدخال الرابط المختصر' },
                    { pattern: /^[a-z0-9-]+$/, message: 'يجب أن يحتوي على أحرف صغيرة وأرقام وشرطة فقط' }
                  ]}
                >
                  <Input placeholder="أدخل الرابط المختصر" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="description"
              label="وصف القسم"
              rules={[{ required: true, message: 'يرجى إدخال وصف القسم' }]}
            >
              <TextArea
                placeholder="أدخل وصف القسم"
                rows={4}
              />
            </Form.Item>

            <Form.Item
              name="status"
              label="الحالة"
              rules={[{ required: true, message: 'يرجى اختيار الحالة' }]}
            >
              <Input.Group compact>
                <Button
                  type="default"
                  style={{ width: '50%' }}
                  onClick={() => form.setFieldsValue({ status: 'active' })}
                >
                  نشط
                </Button>
                <Button
                  type="default"
                  style={{ width: '50%' }}
                  onClick={() => form.setFieldsValue({ status: 'inactive' })}
                >
                  غير نشط
                </Button>
              </Input.Group>
            </Form.Item>

            <Form.Item style={{ marginTop: '24px', textAlign: 'center' }}>
              <Space>
                <Button type="primary" htmlType="submit">
                  {editingSection ? 'تحديث' : 'إضافة'}
                </Button>
                <Button onClick={() => setModalVisible(false)}>
                  إلغاء
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
};

export default Sections;
