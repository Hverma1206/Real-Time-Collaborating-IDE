import React, { useEffect, useRef, useState } from 'react';
import { Layout, Button, Divider, Typography, Select } from 'antd';
import './Editorpage.css';
import Client from './Client.jsx';
import Editor from './Editor.jsx';
import { initSocket } from '../socket.js';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const { Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

export default function EditorPage() {
  const socketRef = useRef(null);
  const location = useLocation();
  const { roomId } = useParams();
  const navigate = useNavigate();
  const username = location.state?.username;

  const [clients, setClients] = useState([]);
  const [role, setRole] = useState('reader'); // Track the role of the current user
  const [isAdmin, setIsAdmin] = useState(false);

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
        
        // Check if this user was the admin
        const storedAdmin = JSON.parse(localStorage.getItem(`admin_${roomId}`) || '{}');
        const isStoredAdmin = storedAdmin.username === username;

        socketRef.current.on('connect', () => {
          socketRef.current.emit('join', { 
            roomId, 
            username,
            isAdmin: isStoredAdmin  // Pass admin status to server
          });
        });

        socketRef.current.on('joined', (data) => {
          if (data && data.clients) {
            setClients(data.clients);
            const currentUser = data.clients.find(c => c.username === username);
            if (currentUser) {
              setRole(currentUser.role);
              setIsAdmin(currentUser.isAdmin);
              
              // Store admin info if this user is admin
              if (currentUser.isAdmin) {
                localStorage.setItem(`admin_${roomId}`, JSON.stringify({
                  username,
                  roomId
                }));
              }
            }
          }
        });

        socketRef.current.on('updateClients', ({ clients }) => {
          setClients(clients); 
        });

        socketRef.current.on('roleChanged', ({ clients }) => {
          setClients(clients);
          const currentUser = clients.find(client => client.username === username);
          if (currentUser) {
            setRole(currentUser.role);
            if (currentUser.role === 'reader') {
              toast.error('You are now in read-only mode');
            }
          }
        });

        socketRef.current.on('left', ({ username: leftUser }) => {
          setClients(prev => prev.filter(client => client.username !== leftUser));
          toast.success(`${leftUser} left the room`);
        });

        socketRef.current.on('disconnected', ({ username: disconnectedUser }) => {
          setClients(prev => prev.filter(client => client.username !== disconnectedUser));
          toast.error(`${disconnectedUser} disconnected`);
        });

      } catch (error) {
        toast.error('Failed to connect to the server.');
        navigate('/');
      }
    };

    init();

    // Cleanup localStorage on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.off('joined');
        socketRef.current.off('left');
        socketRef.current.off('disconnected');
        socketRef.current.disconnect();
        if (!isAdmin) {
          localStorage.removeItem(`admin_${roomId}`);
        }
      }
    };
  }, [navigate, roomId, username]);

  useEffect(() => {
    console.log('Current Room ID:', roomId);
  }, [roomId]);

  const handleRoleChange = (clientSocketId, newRole) => {
    if (isAdmin) {
      socketRef.current.emit('changeRole', { roomId, targetSocketId: clientSocketId, newRole });
    }
  };

  const handleLeaveRoom = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave', { roomId, username });
      navigate('/');
    }
  };

  const handleCopyRoomId = async () => {
    try {
      const currentPath = window.location.pathname;
      const urlRoomId = currentPath.split('/editor/')[1];
      
      if (!urlRoomId) {
        toast.error('Room ID not found');
        return;
      }
      
      await navigator.clipboard.writeText(urlRoomId);
      toast.success('Room ID copied successfully!');
    } catch (err) {
      toast.error('Failed to copy room ID');
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
          <div 
            style={{ 
              backgroundColor: '#3a3a3a',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '20px',
              border: '1px solid #4a4a4a',
              cursor: 'pointer'
            }}
            onClick={handleCopyRoomId}
          >
            <Text 
              strong 
              style={{ 
                color: '#fff', 
                display: 'block', 
                textAlign: 'center',
                fontSize: '14px',
                marginBottom: '4px'
              }}
            >
              Room ID:
            </Text>
            <Text
              style={{ 
                color: '#00ff00', 
                display: 'block', 
                textAlign: 'center',
                fontSize: '16px',
                userSelect: 'all',
                wordBreak: 'break-all'
              }}
            >
              {window.location.pathname.split('/editor/')[1]}
            </Text>
          </div>
          <Divider style={{ backgroundColor: '#3a3a3a' }} />
          <div className="member-avatar">
            {clients.map((client) => (
              <div key={client.socketId} style={{ display: 'flex', alignItems: 'center' }}>
                <Client 
                  username={client.username} 
                  role={client.role}
                  isAdmin={client.isAdmin}
                  currentUserIsAdmin={isAdmin}
                  onRoleChange={handleRoleChange}
                  socketId={client.socketId}
                  currentUsername={username}  
                />
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          <Divider style={{ backgroundColor: '#3a3a3a' }} />
          <Button className="copy-btn" type="primary" block onClick={handleCopyRoomId}>
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
              height: 'calc(100vh - 48px)', 
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
              padding: '20px',
              overflow: 'hidden', 
            }}
          >
            <Editor socketRef={socketRef} roomId={roomId} userRole={role} />
          </div>

        </Content>
      </Layout>
    </Layout>
  );
}