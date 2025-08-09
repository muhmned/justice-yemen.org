import React, { useState } from 'react';
import { Layout, Drawer } from 'antd';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AppHeader from '../../components/admin/AppHeader';
import '../AdminPanel.css';

const { Sider, Content } = Layout;

export default function AdminLayout() {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSidebarCollapse = (collapsed) => {
    setSidebarCollapsed(collapsed);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      {isMobile ? (
        <Drawer
          placement="right"
          closable={true}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          bodyStyle={{ padding: 0, background: '#fff', minHeight: '100vh' }}
          width={250}
        >
          <AdminSidebar collapsed={false} onCollapse={() => setDrawerVisible(false)} />
        </Drawer>
      ) : (
        <Sider
          width={250}
          className="admin-sidebar"
          collapsible
          collapsed={sidebarCollapsed}
          onCollapse={handleSidebarCollapse}
          style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.1)' }}
        >
          <AdminSidebar collapsed={sidebarCollapsed} onCollapse={handleSidebarCollapse} />
        </Sider>
      )}
      <Layout>
        <AppHeader 
          isMobile={isMobile}
          drawerVisible={drawerVisible}
          toggleDrawer={() => setDrawerVisible(!drawerVisible)}
        />
        <Content style={{ 
          margin: 0, 
          padding: isMobile ? 16 : 24, 
          background: '#f5f5f5', 
          minHeight: 'calc(100vh - 64px)' 
        }}>
          <div style={{ 
            maxWidth: '1200px', 
            margin: '0 auto', 
            background: '#ffffff', 
            borderRadius: '8px', 
            padding: isMobile ? 16 : 24, 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            minHeight: 'calc(100vh - 112px)'
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
