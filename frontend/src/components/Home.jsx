import React from 'react';
import './Home.css';

import { Form, Input, Button, Typography } from 'antd';

const { Title, Text } = Typography;

const Home = () => {
  const onFinish = (values) => {
    console.log('Form Values:', values);
  };

  return (
    <div className='cont'>
      <div className='form'>
        <Title level={3} style={{ color: '#FFF' }}>LumosHub</Title>
        <Text className='room-text'>Enter your Room ID</Text>
        <div style={{marginTop:'20px'}}>
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
            <Input placeholder='Room ID' className='custom-input'/>
          </Form.Item>
          <Form.Item
            name='username'
            rules={[{ required: true, message: 'Please Input Your Username!' }]}
          >
            <Input placeholder='Username' className='custom-input'/>
          </Form.Item>
          <Form.Item 
          >
            <Button type='primary' htmlType='submit' block className='custom-btn'> 
              Join
            </Button>
          </Form.Item>
        </Form>
        </div>
        <div className='spacing'>
        <Text className='not-id'> Don't have a Room ID? </Text>
        <Button type='primary' className='create-room-btn' block href='#'>
          Create a Room
        </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
