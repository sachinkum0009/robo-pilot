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
  const [mapInitialized, setMapInitialized] = useState(false);
  const [pubTopicName, setPubTopicName] = useState('/cmd_vel');
  const [pubMessageType, setPubMessageType] = useState('geometry_msgs/Twist');
  const [pubMessageData, setPubMessageData] = useState('{"linear": {"x": 0, "y": 0, "z": 0}, "angular": {"x": 0, "y": 0, "z": 0}}');
  const navigate = useNavigate();
  const rosRef = useRef(null);
  const topicListenerRef = useRef(null);
  const viewerRef = useRef(null);
  const gridClientRef = useRef(null);
  const panViewRef = useRef(null);
  const zoomViewRef = useRef(null);

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
      if (gridClientRef.current) {
        gridClientRef.current = null;
      }
      if (viewerRef.current) {
        // Clear the map viewer
        const mapDiv = document.getElementById('map-viewer');
        if (mapDiv) {
          mapDiv.innerHTML = '';
        }
        viewerRef.current = null;
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
        loadRos2d();
      };
      document.body.appendChild(script);
    } else {
      loadRos2d();
    }
  };

  const loadRos2d = () => {
    // Load ros2d from local file
    if (!window.ROS2D) {
      const script = document.createElement('script');
      script.src = '/src/ros2d.js';
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
        initializeMap();
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

  const initializeMap = () => {
    if (!window.ROS2D || !rosRef.current || mapInitialized) {
      return;
    }

    try {
      // Clear any existing content in the map-viewer div
      const mapDiv = document.getElementById('map-viewer');
      if (mapDiv) {
        mapDiv.innerHTML = '';
      }

      // Create the main viewer
      const viewer = new window.ROS2D.Viewer({
        divID: 'map-viewer',
        width: 640,
        height: 480
      });
      viewerRef.current = viewer;

      // Setup the map client
      const gridClient = new window.ROS2D.OccupancyGridClient({
        ros: rosRef.current,
        rootObject: viewer.scene,
        continuous: true
      });
      gridClientRef.current = gridClient;

      // Scale the canvas to fit to the map
      gridClient.on('change', function() {
        if (gridClient.currentGrid) {
          viewer.scaleToDimensions(gridClient.currentGrid.width, gridClient.currentGrid.height);
          viewer.shift(gridClient.currentGrid.pose.position.x, gridClient.currentGrid.pose.position.y);
        }
      });

      // Setup pan and zoom controls
      const panView = new window.ROS2D.PanView({
        rootObject: viewer.scene
      });
      panViewRef.current = panView;

      const zoomView = new window.ROS2D.ZoomView({
        rootObject: viewer.scene,
        minScale: 0.1
      });
      zoomViewRef.current = zoomView;

      // Add mouse event listeners for pan and zoom
      setupMouseControls(viewer, panView, zoomView);

      setMapInitialized(true);
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }
  };

  const setupMouseControls = (viewer, panView, zoomView) => {
    const canvas = viewer.scene.canvas;
    let isPanning = false;
    let lastMousePos = { x: 0, y: 0 };

    // Mouse down - start panning
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Left mouse button
        isPanning = true;
        lastMousePos = { x: e.offsetX, y: e.offsetY };
        panView.startPan(e.offsetX, e.offsetY);
        canvas.style.cursor = 'grabbing';
      }
    });

    // Mouse move - pan if dragging
    canvas.addEventListener('mousemove', (e) => {
      if (isPanning) {
        panView.pan(e.offsetX, e.offsetY);
        lastMousePos = { x: e.offsetX, y: e.offsetY };
      }
    });

    // Mouse up - stop panning
    canvas.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        isPanning = false;
        canvas.style.cursor = 'grab';
      }
    });

    // Mouse leave - stop panning
    canvas.addEventListener('mouseleave', () => {
      isPanning = false;
      canvas.style.cursor = 'grab';
    });

    // Mouse wheel - zoom
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      
      zoomView.startZoom(centerX, centerY);
      
      // Zoom in or out based on wheel direction
      const zoomAmount = e.deltaY > 0 ? 0.9 : 1.1;
      zoomView.zoom(zoomAmount);
    }, { passive: false });

    // Set initial cursor style
    canvas.style.cursor = 'grab';
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

  const handlePublish = () => {
    if (!rosRef.current || rosStatus !== 'Connected') {
      alert('Please wait for ROS connection to be established');
      return;
    }

    try {
      // Parse the message data
      const messageData = JSON.parse(pubMessageData);

      // Create a topic to publish to
      const topic = new window.ROSLIB.Topic({
        ros: rosRef.current,
        name: pubTopicName,
        messageType: pubMessageType,
      });

      // Create the message
      const message = new window.ROSLIB.Message(messageData);

      // Publish the message
      topic.publish(message);

      alert(`Message published to ${pubTopicName}`);
    } catch (error) {
      alert(`Failed to publish: ${error.message}\nPlease check your message format.`);
    }
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
          {/* Robo Pilot Dashboard Info Card */}
          <div className="info-card">
            <div className="card-icon">🤖</div>
            <h3>Robo Pilot Dashboard</h3>
            <p>
              This is your central hub for managing and controlling your robotic systems.
              Start exploring the features to get the most out of your experience.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card" onClick={() => navigate('/chat')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">💬</div>
              <h4>Robot Chat</h4>
              <p>Chat with your robot assistant</p>
            </div>

            <div className="stat-card" onClick={() => navigate('/fleet')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">🚀</div>
              <h4>Fleet Manager</h4>
              <p>Monitor and manage your robot fleet</p>
            </div>

            <div className="stat-card" onClick={() => navigate('/orchestration')} style={{ cursor: 'pointer' }}>
              <div className="stat-icon">⚙️</div>
              <h4>Orchestration</h4>
              <p>Coordinate workflows and tasks</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <h4>Analytics</h4>
              <p>View your robot performance metrics</p>
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

          {/* ROS2 Topic Publisher Section */}
          <div className="topic-publisher-section">
            <h2>ROS2 Topic Publisher</h2>
            <div className="publisher-controls">
              <div className="input-group">
                <label>Topic Name:</label>
                <input
                  type="text"
                  value={pubTopicName}
                  onChange={(e) => setPubTopicName(e.target.value)}
                  placeholder="/cmd_vel"
                />
              </div>
              <div className="input-group">
                <label>Message Type:</label>
                <input
                  type="text"
                  value={pubMessageType}
                  onChange={(e) => setPubMessageType(e.target.value)}
                  placeholder="geometry_msgs/Twist"
                />
              </div>
              <div className="input-group">
                <label>Message Data (JSON):</label>
                <textarea
                  value={pubMessageData}
                  onChange={(e) => setPubMessageData(e.target.value)}
                  placeholder='{"data": "hello"}'
                  rows={6}
                />
              </div>
              <div className="button-group">
                <button onClick={handlePublish} className="publish-button">
                  Publish Message
                </button>
              </div>
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

          {/* Map Viewer Section */}
          <div className="map-viewer-section">
            <h2>Map Viewer</h2>
            <div id="map-viewer" className="map-canvas"></div>
            <p className="map-info">
              {mapInitialized 
                ? '✓ Map viewer initialized. Waiting for map data from /map topic...' 
                : 'Waiting for ROS connection to initialize map viewer...'}
            </p>
            {mapInitialized && (
              <div className="map-controls-hint">
                <span><span className="control-icon">🖱️ Drag</span> to pan</span>
                <span><span className="control-icon">🔍 Scroll</span> to zoom</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
