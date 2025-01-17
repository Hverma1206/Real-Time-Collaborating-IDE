import React from 'react';
import { Avatar, Select } from 'antd';
import ColorHash from 'color-hash';

const { Option } = Select;
const colorHash = new ColorHash();

export default function Client({ username, role, isAdmin, currentUserIsAdmin, onRoleChange, socketId, currentUsername }) {
  const isCurrentUser = username === currentUsername;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: '12px',
      justifyContent: 'space-between',
      width: '100%',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'background-color 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          style={{
            backgroundColor: colorHash.hex(username),
            marginRight: '12px',
            border: '2px solid rgba(255, 255, 255, 0.1)',
          }}
          size={40}
        >
          {username.charAt(0).toUpperCase()}
        </Avatar>
        <div>
          <div style={{
            color: '#fff',
            fontWeight: '500',
            fontSize: '14px'
          }}>
            {username}
            {isAdmin && (
              <span style={{
                marginLeft: '8px',
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '11px'
              }}>
                ADMIN
              </span>
            )}
          </div>
          <small style={{
            color: '#888',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: role === 'writer' ? '#4CAF50' : '#FFA000',
              display: 'inline-block'
            }} />
            {role}
          </small>
        </div>
      </div>

      {currentUserIsAdmin && !isCurrentUser && (
        <Select
          defaultValue={role}
          style={{
            width: 100,
            marginLeft: '8px'
          }}
          onChange={(newRole) => onRoleChange(socketId, newRole)}
          className="role-select"
          popupClassName="role-select"
          dropdownStyle={{
            backgroundColor: '#2B2B2B',
            borderRadius: '4px',
            border: '1px solid #3a3a3a'
          }}
        >
          <Option value="reader" className="role-select-option">Reader</Option>
          <Option value="writer" className="role-select-option">Writer</Option>
        </Select>
      )}
    </div>
  );
}
