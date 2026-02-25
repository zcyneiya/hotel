import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { AuditOutlined, HomeOutlined, LogoutOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';

const { Header, Content, Sider } = Layout;

function AdminLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'hotels',
      icon: <HomeOutlined />,
      label: '酒店管理',
      onClick: () => navigate('/admin/hotels')
    },
    {
      key: 'offline',
      icon: <DeleteOutlined />,
      label: '下线酒店',
      onClick: () => navigate('/admin/offline')
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          易宿酒店管理平台 - 管理员
        </div>
        <div style={{ color: 'white' }}>
          {user?.username} | <a onClick={handleLogout} style={{ color: 'white' }}><LogoutOutlined /> 退出</a>
        </div>
      </Header>
      <Layout>
        <Sider width={200}>
          <Menu
            mode="inline"
            defaultSelectedKeys={['audit']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff'
            }}
          >
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
