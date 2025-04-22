import React, { useState, useEffect, useRef } from 'react';
import { Input, Button, Spin, message as antMessage } from 'antd';
import ColorHash from 'color-hash';
import './Chat.css';

const colorHash = new ColorHash();

const Chat = ({ socketRef, roomId, username }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false); // Start with loading false
    const [typingUsers, setTypingUsers] = useState([]);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (socketRef.current) {
            // Listen for new messages
            socketRef.current.on('receiveMessage', (messageData) => {
                setMessages(prev => [...prev, messageData]);
            });
            
            // Listen for typing indicators
            socketRef.current.on('userTyping', ({ user }) => {
                if (user !== username) {
                    setTypingUsers(prev => {
                        if (!prev.includes(user)) {
                            return [...prev, user];
                        }
                        return prev;
                    });
                }
            });
            
            // Listen for stopped typing
            socketRef.current.on('userStoppedTyping', ({ user }) => {
                if (user !== username) {
                    setTypingUsers(prev => prev.filter(u => u !== user));
                }
            });
            
            // Listen for errors
            socketRef.current.on('chatError', (errorData) => {
                setError(errorData.message);
                antMessage.error(errorData.message);
            });
        }
        
        return () => {
            if (socketRef.current) {
                socketRef.current.off('receiveMessage');
                socketRef.current.off('userTyping');
                socketRef.current.off('userStoppedTyping');
                socketRef.current.off('chatError');
            }
        };
    }, [socketRef, roomId, username]);

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
            
            socketRef.current.emit('sendMessage', {
                roomId,
                ...messageData
            });
            
            // Add the message locally to provide immediate feedback
            setMessages(prev => [...prev, messageData]);
            
            // Clear the typing indicator
            socketRef.current.emit('stopTyping', { roomId, user: username });
            clearTimeout(typingTimeoutRef.current);
            
            setNewMessage('');
        }
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);
        
        if (socketRef.current) {
            // Clear previous timeout
            clearTimeout(typingTimeoutRef.current);
            
            // Send typing indicator
            socketRef.current.emit('typing', { roomId, user: username });
            
            // Set timeout to clear typing indicator after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current.emit('stopTyping', { roomId, user: username });
            }, 2000);
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    // Group messages by date
    const groupedMessages = messages.reduce((acc, msg) => {
        const date = formatDate(msg.timestamp);
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(msg);
        return acc;
    }, {});

    if (error) {
        return <div className="chat-error">Error loading chat: {error}</div>;
    }

    return (
        <div className="chat-container">
            <div className="messages-container">
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" tip="Loading messages..." />
                    </div>
                ) : (
                    <>
                        {Object.keys(groupedMessages).length === 0 && (
                            <div className="empty-chat-message">
                                No messages yet. Start a conversation!
                            </div>
                        )}
                        
                        {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                            <React.Fragment key={date}>
                                <div className="date-separator">
                                    <span>{date}</span>
                                </div>
                                {dateMessages.map((msg, index) => (
                                    <div 
                                        key={`${date}-${index}`} 
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
                            </React.Fragment>
                        ))}
                        {typingUsers.length > 0 && (
                            <div className="typing-indicator">
                                <div className="typing-animation">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                <span>{typingUsers.length === 1 
                                    ? `${typingUsers[0]} is typing...` 
                                    : `${typingUsers.join(', ')} are typing...`}
                                </span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>
            <form onSubmit={sendMessage} className="chat-input-form">
                <Input
                    value={newMessage}
                    onChange={handleTyping}
                    onPressEnter={(e) => {
                        if (!e.shiftKey) {
                            sendMessage(e);
                        }
                    }}
                    placeholder="Type a message..."
                    className="chat-input"
                    disabled={loading}
                />
                <Button 
                    type="primary" 
                    htmlType="submit"
                    className="send-button"
                    disabled={loading || !newMessage.trim()}
                >
                    Send
                </Button>
            </form>
        </div>
    );
};

export default Chat;
