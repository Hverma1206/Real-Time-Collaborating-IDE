import React, { useEffect, useRef, useState } from 'react';
import { Layout, Button, Divider, Typography } from 'antd';
import './Editorpage.css';
import Client from './Client.jsx';
import Editor from './Editor.jsx';
import { initSocket } from '../socket.js';

const { Sider, Content } = Layout;
const { Title } = Typography;

export default function EditorPage() {
  const socketRef = useRef(null)
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket
      socketRef.current = join("Himanshu",{
        roomId,
        username 
      })
    }

    init();

  }, [])
  const [clients, setClients] = useState([
    { SocketId: 1, username: "Himanshu" },
    { SocketId: 2, username: "Verma" },
    { SocketId: 3, username: "" },
    { SocketId: 4, username: "" },
  ]);

  return (
    <Layout style={{ height: '100vh' }}>
      {/* Sidebar */}
      <Sider
        width={250}
        style={{
          background: '#2B2B2B',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '20px',
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ flexGrow: 1 }}>
          <Title level={3} style={{ color: '#fff', marginBottom: '20px', textAlign: 'center' }}>
            LumosHub
          </Title>
          <Divider style={{ backgroundColor: '#3a3a3a' }} />
          <div className='member-avatar'>
            {clients.map((client) => (
              <Client key={client.SocketId} username={client.username} />
            ))}
          </div>
        </div>

        {/* Buttons at the bottom */}
        <div style={{ marginTop: 'auto' }}>
          <Divider style={{ backgroundColor: '#3a3a3a' }} />
          <Button className="copy-btn" type="primary" block>
            Copy Room ID
          </Button>
          <Button className="leave-btn" type="danger" block>
            Leave Room
          </Button>
        </div>
      </Sider>

      {/* Code Editor */}
      <Layout>
        <Content
          style={{
            background: '#1E1E1E',
            padding: '24px',
            minHeight: '100vh',
            color: '#fff',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: '#282C34',
              height: '100%',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px',
            }}
          >
            <Editor />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
