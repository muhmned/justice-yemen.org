import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Button, Avatar, Dropdown, Badge } from 'antd';
import { BellOutlined, UserOutlined, MenuOutlined } from '@ant-design/icons';

const { Header } = Layout;

const AppHeader = ({ isMobile, toggleDrawer }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // حذف التوكن من localStorage
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    
    // التوجيه إلى صفحة تسجيل الدخول
    navigate('/admin/login');
  };

  return (
    <Header style={{ 
      background: '#fff', 
      padding: isMobile ? '0 16px' : '0 24px', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderBottom: '1px solid #f0f0f0',
      height: 64,
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {isMobile && (
          <Button 
            icon={<MenuOutlined />} 
            onClick={toggleDrawer} 
            type="text" 
            shape="circle"
          />
        )}
        <div style={{ fontWeight: 'bold', fontSize: 20, color: '#1e3c72' }}>
          لوحة التحكم
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <Dropdown
          menu={{
            items: [
              {  
                key: 'profile', 
                label: 'الملف الشخصي',
                onClick: () => navigate('/admin/profile')
              },
              { 
                key: 'logout', 
                label: 'تسجيل الخروج',
                onClick: handleLogout,
                danger: true,
              }
            ]
          }}
          trigger={['click']}
        >
          <Avatar 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1e3c72', cursor: 'pointer' }} 
          />
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
