import React from 'react'
import { Avatar } from 'antd'
import ColorHash from 'color-hash'

const colorHash = new ColorHash()

export default function Client({ username }) {
  const avatarColor = colorHash.hex(username);

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
      <Avatar
        style={{
          backgroundColor: avatarColor, 
          marginRight: '8px',
        }}
        size={50}
      >
        {username.charAt(0).toUpperCase()} 
      </Avatar>
      <span>{username}</span>
    </div>
  )
}
