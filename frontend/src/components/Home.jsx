import React, { useState } from 'react'
import './Home.css'
import { v4 as uuid } from 'uuid'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Typography } from 'antd'
import toast from 'react-hot-toast';


const { Title, Text } = Typography;

const Home = () => {
  const [roomId, setRoomId] = useState("");
  const [form] = Form.useForm();
  const [username, setUsername] = useState("")
  const navigate = useNavigate()

  const onFinish = (values) => {
    console.log('Form Values:', values)
  };

  const generateRoomId = (e) => {
    e.preventDefault()
    const id = uuid().slice(0, 6);
    setRoomId(id)
    form.setFieldsValue({ RoomID: id })
    toast.success(("Room Id is generated"))
  }

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Both the field is required!")
      return;
    }
    navigate(`/editor/${roomId}`,{
      state : {username}, 
    })
    toast.success(("Room is created"))

  }
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
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Form.Item>
            <Form.Item>
              <Button type='primary' htmlType='submit' block className='custom-btn'
                onClick={joinRoom}
              >
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
  )
}

export default Home;
