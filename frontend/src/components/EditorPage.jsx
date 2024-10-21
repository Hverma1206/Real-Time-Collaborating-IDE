import React from 'react';
import { Layout, Button, List, Typography } from 'antd';
import './Editorpage.css';

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function EditorPage() {
  const members = ['User 1', 'User 2', 'User 3']; // Example members, you can dynamically update this

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Sidebar for members */}
      <Sider
        width={200}
        style={{
          background: '#1c1c1c',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '16px'
        }}
      >
        {/* Members Section */}
        <div>
          <Title level={4} style={{ color: '#fff' }}>
            Members
          </Title>
          <List
            dataSource={members}
            renderItem={item => (
              <List.Item style={{ color: '#fff' }}>{item}</List.Item>
            )}
            style={{ color: '#fff' }}
          />
        </div>

        {/* Buttons Section */}
        <div>
          <Button type="primary" block style={{ marginBottom: '10px' }}>
            Copy Room ID
          </Button>
          <Button type="danger" block>
            Leave Room
          </Button>
        </div>
      </Sider>

      {/* Code Editor Section */}
      <Layout>
        <Content
          style={{
            background: '#282c34',
            padding: '24px',
            minHeight: 280,
            color: '#fff',
          }}
        >
          {/* Code editor would go here */}
          <div style={{ height: '100%', border: '1px solid #444' }}>
            <p style={{ color: '#fff' }}>Code editor will go here</p>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
