import React, { useEffect, useRef, useState } from 'react';
import { Layout, Button, Divider, Typography, Select } from 'antd';
import './Editorpage.css';
import Client from './Client.jsx';
import Editor from './Editor.jsx';
import { initSocket } from '../socket.js';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const { Sider, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

export default function EditorPage() {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [clients, setClients] = useState([]);
  const [role, setRole] = useState('reader'); // Track the role of the current user

  useEffect(() => {
    if (!username) {
      toast.error('Username is missing, redirecting to the home page.');
      setTimeout(() => navigate('/'), 0);
    }
  }, [username, navigate]);

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();

        const handleError = (e) => {
          toast.error('Socket Connection Failed');
          navigate('/');
        };

        socketRef.current.on('connect_error', handleError);
        socketRef.current.on('connect_failed', handleError);

        socketRef.current.on('connect', () => {
          socketRef.current.emit('join', { roomId, username });
        });

        socketRef.current.on('joined', (data) => {
          if (data && data.clients) {
            const { clients, joinedUser } = data; // Destructure joinedUser
            setClients(clients);
            
            if (joinedUser !== username) {
              toast.success(`${joinedUser} joined the room`); // Display joinedUser's name in the toast
            }

            // Set the role of the current user based on server data
            const currentUser = clients.find((client) => client.username === username);
            if (currentUser) {
              setRole(currentUser.role);
            }
          }
        });

        socketRef.current.on('updateClients', ({ clients }) => {
          setClients(clients); // Update clients' role data
        });

      } catch (error) {
        toast.error('Failed to connect to the server.');
        navigate('/');
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [navigate, roomId, username]);

  const handleRoleChange = (clientSocketId, newRole) => {
    if (role === 'admin') {
      socketRef.current.emit('changeRole', { targetSocketId: clientSocketId, newRole });
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave', { roomId, username });
      navigate('/');
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
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
          <div className="member-avatar">
            {clients.map((client) => (
              <div key={client.socketId} style={{ display: 'flex', alignItems: 'center' }}>
                <Client username={client.username} role={client.role} />
                
              
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Divider style={{ backgroundColor: '#3a3a3a' }} />
          <Button className="copy-btn" type="primary" block>
            Copy Room ID
          </Button>
          <Button className="leave-btn" type="danger" block onClick={handleLeaveRoom}>
            Leave Room
          </Button>
        </div>
      </Sider>

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

          </div>
        </Content>
      </Layout>
    </Layout>
  );
}