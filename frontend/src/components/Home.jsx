import React, { useState } from 'react';
import './Home.css';
import { v4 as uuid } from 'uuid';
import { Form, Input, Button, Typography } from 'antd';

const { Title, Text } = Typography;

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const onFinish = (values) => {
    console.log('Form Values:', values);
  };

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid();
    setRoomId(id); // Set generated Room ID in state
  };

  return (
    <div className='cont'>
      <div className='form'>
        <Title level={3} style={{ color: '#FFF' }}>LumosHub</Title>
        <Text className='room-text'>Enter your Room ID</Text>
        <div style={{ marginTop: '20px' }}>
          <Form
            name='join_room'
            onFinish={onFinish}
            layout='vertical'
            className='Form'
          >
            <Form.Item 
              name="RoomID"
              rules={[{ required: true, message: 'Please Input Your Room ID!' }]}
            >
              <Input
                placeholder='Room ID'
                className='custom-input'
                value={roomId} // Bind the input value to roomId state
                onChange={(e) => setRoomId(e.target.value)} // Allow manual input too
              />
            </Form.Item>
            <Form.Item
              name='username'
              rules={[{ required: true, message: 'Please Input Your Username!' }]}
            >
              <Input
                placeholder='Username'
                className='custom-input'
                value={username}
                onChange={(e) => setUsername(e.target.value)} // Update username state
              />
            </Form.Item>
            <Form.Item>
              <Button type='primary' htmlType='submit' block className='custom-btn'>
                Join
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div className='spacing'>
          <Text className='not-id'>Don't have a Room ID?</Text>
          <Button
            type='primary'
            className='create-room-btn'
            block
            onClick={generateRoomId} 
          >
            Create a Room
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
