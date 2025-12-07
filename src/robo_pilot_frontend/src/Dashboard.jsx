import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [username, setUsername] = useState('');
  const [rosStatus, setRosStatus] = useState('Not Connected');
  const [topicMessages, setTopicMessages] = useState([]);
  const [topicName, setTopicName] = useState('/my_topic');
  const [messageType, setMessageType] = useState('std_msgs/String');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();
  const rosRef = useRef(null);
  const topicListenerRef = useRef(null);

  useEffect(() => {
    // Check if user is authenticated
    const isAuth = localStorage.getItem('isAuthenticated');
    const storedUsername = localStorage.getItem('username');
    
    if (!isAuth || !storedUsername) {
      // Redirect to home if not authenticated
      navigate('/');
    } else {
      setUsername(storedUsername);
    }

    // Initialize ROS connection
    initializeRosConnection();

    // Cleanup on unmount
    return () => {
      if (topicListenerRef.current) {
        topicListenerRef.current.unsubscribe();
      }
      if (rosRef.current) {
        rosRef.current.close();
      }
    };
  }, [navigate]);

  const initializeRosConnection = () => {
    // Load roslib from CDN
    if (!window.ROSLIB) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/roslib@1/build/roslib.min.js';
      script.onload = () => {
        connectToRos();
      };
      document.body.appendChild(script);
    } else {
      connectToRos();
    }
  };

  const connectToRos = () => {
    try {
      const ros = new window.ROSLIB.Ros({ url: 'ws://localhost:9090' });
      rosRef.current = ros;

      ros.on('connection', () => {
        setRosStatus('Connected');
      });

      ros.on('error', (error) => {
        setRosStatus(`Error: ${error}`);
      });

      ros.on('close', () => {
        setRosStatus('Closed');
        setIsSubscribed(false);
      });
    } catch (error) {
      setRosStatus(`Failed to connect: ${error.message}`);
    }
  };

  const handleSubscribe = () => {
    if (!rosRef.current || rosStatus !== 'Connected') {
      alert('Please wait for ROS connection to be established');
      return;
    }

    // Unsubscribe from previous topic if exists
    if (topicListenerRef.current) {
      topicListenerRef.current.unsubscribe();
    }

    // Clear previous messages
    setTopicMessages([]);

    try {
      const topic_listener = new window.ROSLIB.Topic({
        ros: rosRef.current,
        name: topicName,
        messageType: messageType,
      });

      topic_listener.subscribe((message) => {
        const timestamp = new Date().toLocaleTimeString();
        setTopicMessages((prev) => [
          ...prev,
          { time: timestamp, data: JSON.stringify(message, null, 2) }
        ]);
      });

      topicListenerRef.current = topic_listener;
      setIsSubscribed(true);
    } catch (error) {
      alert(`Failed to subscribe: ${error.message}`);
    }
  };

  const handleUnsubscribe = () => {
    if (topicListenerRef.current) {
      topicListenerRef.current.unsubscribe();
      topicListenerRef.current = null;
      setIsSubscribed(false);
    }
  };

  const handleClearMessages = () => {
    setTopicMessages([]);
  };

  const getCsrfToken = () => {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  const handleLogout = async () => {
    try {
      const API_BASE_URL = "http://localhost:8000";
      await fetch(`${API_BASE_URL}/api/logout/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": getCsrfToken(),
        },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      // Clear local storage
      localStorage.removeItem('username');
      localStorage.removeItem('isAuthenticated');
      // Redirect to home
      navigate('/');
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome, {username}! 🎉</h1>
            <p className="welcome-subtitle">
              You're now logged into your Robo Pilot Dashboard
            </p>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>

        <div className="dashboard-content">
          {/* ROS Connection Status Section */}
          <div className="ros-status-section">
            <h2>ROS Connection Status</h2>
            <div className="status-display">
              <span className="status-label">Connection:</span>
              <span className={`status-value ${rosStatus === 'Connected' ? 'connected' : 'disconnected'}`}>
                {rosStatus}
              </span>
            </div>
          </div>

          {/* ROS2 Topic Subscriber Section */}
          <div className="topic-subscriber-section">
            <h2>ROS2 Topic Subscriber</h2>
            <div className="subscriber-controls">
              <div className="input-group">
                <label>Topic Name:</label>
                <input
                  type="text"
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  placeholder="/my_topic"
                  disabled={isSubscribed}
                />
              </div>
              <div className="input-group">
                <label>Message Type:</label>
                <input
                  type="text"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value)}
                  placeholder="std_msgs/String"
                  disabled={isSubscribed}
                />
              </div>
              <div className="button-group">
                {!isSubscribed ? (
                  <button onClick={handleSubscribe} className="subscribe-button">
                    Subscribe
                  </button>
                ) : (
                  <button onClick={handleUnsubscribe} className="unsubscribe-button">
                    Unsubscribe
                  </button>
                )}
                <button onClick={handleClearMessages} className="clear-button">
                  Clear Messages
                </button>
              </div>
            </div>
            <div className="messages-container">
              <h3>Messages Received: ({topicMessages.length})</h3>
              <div className="messages-list">
                {topicMessages.length === 0 ? (
                  <p className="no-messages">No messages received yet. Subscribe to a topic to see messages.</p>
                ) : (
                  <ul>
                    {topicMessages.map((msg, index) => (
                      <li key={index}>
                        <span className="message-time">[{msg.time}]</span>
                        <pre className="message-data">{msg.data}</pre>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">🤖</div>
            <h3>Robo Pilot Dashboard</h3>
            <p>
              This is your central hub for managing and controlling your robotic systems.
              Start exploring the features to get the most out of your experience.
            </p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <h4>Analytics</h4>
              <p>View your robot performance metrics</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚙️</div>
              <h4>Settings</h4>
              <p>Configure your preferences</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🔔</div>
              <h4>Notifications</h4>
              <p>Stay updated with alerts</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📈</div>
              <h4>Reports</h4>
              <p>Access detailed reports</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
