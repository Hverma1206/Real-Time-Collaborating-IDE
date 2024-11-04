import React, { useState } from 'react';
import './Home.css';
import { v4 as uuid } from 'uuid';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Typography } from 'antd';
import toast from 'react-hot-toast';

const { Title, Text } = Typography;

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const generateRoomId = (e) => {
    e.preventDefault();
    const id = uuid().slice(0, 6);
    setRoomId(id);
    form.setFieldsValue({ RoomID: id });
    toast.success("Room ID generated");
  };

  const onFinish = (values) => {
    if (!values.RoomID || !values.username) {
      toast.error("Both fields are required!");
      return;
    }
    navigate(`/editor/${values.RoomID}`, {
      state: { username: values.username },
    });
    toast.success("Room created");
  };

  return (
    <div className='cont'>
      <div className='form'>
        <Title level={3} style={{ color: '#FFF' }}>LumosHub</Title>
        <Text className='room-text'>Enter your Room ID</Text>
        <div style={{ marginTop: '20px' }}>
          <Form
            form={form}
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
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              />
            </Form.Item>
            <Form.Item
              name='username'
              rules={[{ required: true, message: 'Please Input Your Username!' }]}
            >
              <Input
                placeholder='Username'
                className='custom-input'
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
