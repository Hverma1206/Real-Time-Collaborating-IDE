import React, { useState, useEffect, useRef } from 'react';
import { Input, Button } from 'antd';
import ColorHash from 'color-hash';
import './Chat.css';

const colorHash = new ColorHash();

const Chat = ({ socketRef, roomId, username }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on('receiveMessage', (messageData) => {
                setMessages(prev => [...prev, messageData]);
            });
        }
        return () => {
            socketRef.current?.off('receiveMessage');
        };
    }, [socketRef]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && socketRef.current) {
            const messageData = {
                message: newMessage.trim(),
                sender: username,
                timestamp: new Date().toISOString()
            };
            
            // Only emit to server, don't update local state directly
            // Local state will be updated when receiveMessage event is triggered
            socketRef.current.emit('sendMessage', {
                roomId,
                ...messageData
            });
            
            setNewMessage('');
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-container">
            <div className="messages-container">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`message ${msg.sender === username ? 'own-message' : ''}`}
                    >
                        <div className="message-header">
                            <span className="sender-name" style={{ 
                                color: msg.sender === username ? '#fff' : colorHash.hex(msg.sender)
                            }}>
                                {msg.sender === username ? 'You' : msg.sender}
                            </span>
                            <span className="message-time">{formatTime(msg.timestamp)}</span>
                        </div>
                        <div className="message-content">
                            {msg.message}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="chat-input-form">
                <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            sendMessage(e);
                        }
                    }}
                    placeholder="Type a message..."
                    className="chat-input"
                />
                <Button 
                    type="primary" 
                    htmlType="submit"
                    className="send-button"
                >
                    Send
                </Button>
            </form>
        </div>
    );
};

export default Chat;
