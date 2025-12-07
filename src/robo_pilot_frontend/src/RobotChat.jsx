import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChatSession, useChatMessages, useChatInteract } from '@chainlit/react-client';
import './RobotChat.css';

// Generate UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Clean message content by removing <think> tags and their content
function cleanMessageContent(content) {
  if (!content) return '';
  
  // Remove everything between <think> and </think> tags including the tags
  const cleanedContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  
  return cleanedContent;
}

function RobotChat() {
  const [username, setUsername] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const navigate = useNavigate();
  
  const { connect, disconnect, session } = useChatSession();
  const { messages } = useChatMessages();
  const { sendMessage } = useChatInteract();

  // Debug: Log messages when they change
  useEffect(() => {
    console.log('Messages updated:', messages);
  }, [messages]);

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated');
    const storedUsername = localStorage.getItem('username');
    
    if (!isAuth || !storedUsername) {
      navigate('/');
      return;
    }
    
    setUsername(storedUsername);

    // Connect to Chainlit server only once
    if (!session) {
      connect({
        userEnv: {
          user: storedUsername || 'Guest'
        }
      });
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !session) {
      return;
    }

    try {
      // Send message with proper Chainlit message object format with UUID v4
      const message = {
        id: generateUUID(),
        content: inputMessage,
        output: inputMessage,
        createdAt: new Date().toISOString()
      };
      
      await sendMessage(message);
      setInputMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="robot-chat-container">
      <div className="chat-header">
        <div className="header-content">
          <button onClick={handleBackToDashboard} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>🤖 Chat with Robot</h1>
          <div className="user-info">
            <span className="username">{username}</span>
            <span className={`connection-status ${session ? 'connected' : 'disconnected'}`}>
              {session ? '● Connected' : '○ Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="chat-main">
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>Start a conversation with your robot</h3>
              <p>Ask questions, give commands, or just chat!</p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message, index) => {
                // Extract message content from various possible fields
                const messageContent = message.output || message.content || message.text || '';
                const displayContent = message.type === 'user_message' 
                  ? messageContent 
                  : cleanMessageContent(messageContent);
                
                // Skip rendering if no content
                if (!displayContent) {
                  console.log('Skipping message with no content:', message);
                  return null;
                }
                
                return (
                  <div 
                    key={message.id || index} 
                    className={`message ${message.type === 'user_message' ? 'user-message' : 'bot-message'}`}
                  >
                    <div className="message-avatar">
                      {message.type === 'user_message' ? '👤' : '🤖'}
                    </div>
                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-author">
                          {message.type === 'user_message' ? username : 'Robot'}
                        </span>
                        <span className="message-time">
                          {message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''}
                        </span>
                      </div>
                      <div className="message-text">
                        {displayContent}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="input-area">
          <div className="input-container">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
              rows={3}
              disabled={!session}
            />
            <button 
              onClick={handleSendMessage} 
              className="send-button"
              disabled={!inputMessage.trim() || !session}
            >
              Send 📤
            </button>
          </div>
          {!session && (
            <div className="connection-warning">
              ⚠️ Not connected to chat server. Please check if the Chainlit server is running.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RobotChat;
