import React from 'react'
import {
  Form,
  Input,
  Button,
  Typography

} from 'antd'

const {Title, Text,Link} = Typography;
const Home = () => {
  const onFinish =(values) =>{
    console.log('Form Values:', values)
  }
  return (
    <div classname='container'>
      <div classname='form-wrapper'>
        <Title level ={3} style={{color:'#fff'}}></Title>
        </div>
       
    </div>
  )
}
export default Home;
