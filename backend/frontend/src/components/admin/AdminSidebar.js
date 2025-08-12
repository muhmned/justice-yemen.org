import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminSidebar.css';
import { Menu, Layout, Avatar, Typography, Badge, Button, Dropdown } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  SettingOutlined,
  BarChartOutlined,
  FolderOutlined,
  EditOutlined,
  LogoutOutlined,
  BellOutlined,
  CloudUploadOutlined,
  MailOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const AdminSidebar = ({ collapsed, onCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission, hasRole } = useAuth();

  const handleMenuClick = (e) => {
    navigate(e.key);
    if (window.innerWidth <= 900) {
      onCollapse(true);
    }
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'لوحة التحكم',
      permission: 'dashboard_view',
    },
    {
      key: '/admin/internal-reports',
      icon: <BarChartOutlined />,
      label: 'التقارير والإحصائيات',
      permission: 'reports_view',
    },
    {
      key: '/admin/profile',
      icon: <UserOutlined />,
      label: 'الملف الشخصي',
    },
    {
      key: '/admin/messages',
      icon: <MailOutlined />,
      label: 'إدارة الرسائل',
      permission: 'messages_view',
    },
    {
      type: 'divider',
    },
    {
      key: 'content',
      icon: <FileTextOutlined />,
      label: 'إدارة المحتوى',
      children: [
        {
          key: '/admin/articles',
          label: 'المقالات',
          permission: 'articles_view',
        },
        {
          key: '/admin/news',
          label: 'الأخبار',
          permission: 'news_view',
        },
        {
          key: '/admin/reports',
          label: 'التقارير',
          permission: 'reports_view',
        },
        {
          key: '/admin/sections',
          label: 'الأقسام',
        },
      ],
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'إدارة المستخدمين',
      children: [
        {
          key: '/admin/users',
          label: 'المستخدمين',
          permission: 'users_view',
        },
        {
          key: '/admin/activity-log',
          label: 'سجل النشاطات',
        },
        {
          key: '/admin/permissions',
          label: 'الصلاحيات',
          role: 'system_admin',
        },
      ],
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'الإعدادات',
      children: [
        {
          key: '/admin/settings',
          label: 'إعدادات الموقع',
          permission: 'settings_view',
        },
        {
          key: '/admin/about-edit',
          label: 'تعديل "من نحن"',
        },
        {
          key: '/admin/backup',
          label: 'النسخ الاحتياطي',
          permission: 'backup_manage',
        },
      ],
    },
  ];

  const filterMenuItems = (items) => {
    return items
      .map((item) => {
        if (item.children) {
          const filteredChildren = filterMenuItems(item.children);
          if (filteredChildren.length > 0) {
            return { ...item, children: filteredChildren };
          }
          return null;
        }
        if (item.permission && !hasPermission(item.permission)) {
          return null;
        }
        if (item.role && !hasRole(item.role)) {
          return null;
        }
        return item;
      })
      .filter(Boolean);
  };

  return (
    <div className="admin-sidebar-container">
      <div className="admin-sidebar-header">
        <Avatar size={collapsed ? 40 : 64} icon={<UserOutlined />} />
        {!collapsed && <h3>لوحة التحكم</h3>}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        items={filterMenuItems(menuItems)}
      />
    </div>
  );
};

export default AdminSidebar;
