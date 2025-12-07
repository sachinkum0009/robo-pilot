import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './FleetManager.css';

function FleetManager() {
  const [username, setUsername] = useState('');
  const [selectedRobot, setSelectedRobot] = useState(null);
  const navigate = useNavigate();

  // Dummy fleet data
  const fleetData = [
    {
      id: 'ROB-001',
      name: 'Alpha Explorer',
      status: 'active',
      battery: 87,
      location: 'Warehouse A',
      lastActive: '2 mins ago',
      tasks: 12,
      speed: 1.2,
      temperature: 42
    },
    {
      id: 'ROB-002',
      name: 'Beta Navigator',
      status: 'active',
      battery: 65,
      location: 'Warehouse B',
      lastActive: '5 mins ago',
      tasks: 8,
      speed: 0.8,
      temperature: 38
    },
    {
      id: 'ROB-003',
      name: 'Gamma Scout',
      status: 'charging',
      battery: 34,
      location: 'Charging Station 1',
      lastActive: '15 mins ago',
      tasks: 0,
      speed: 0.0,
      temperature: 35
    },
    {
      id: 'ROB-004',
      name: 'Delta Transporter',
      status: 'active',
      battery: 92,
      location: 'Warehouse C',
      lastActive: '1 min ago',
      tasks: 15,
      speed: 1.5,
      temperature: 45
    },
    {
      id: 'ROB-005',
      name: 'Epsilon Carrier',
      status: 'maintenance',
      battery: 100,
      location: 'Maintenance Bay',
      lastActive: '2 hours ago',
      tasks: 0,
      speed: 0.0,
      temperature: 28
    },
    {
      id: 'ROB-006',
      name: 'Zeta Hauler',
      status: 'active',
      battery: 78,
      location: 'Warehouse A',
      lastActive: '3 mins ago',
      tasks: 10,
      speed: 1.0,
      temperature: 40
    }
  ];

  const fleetStats = {
    total: 6,
    active: 4,
    charging: 1,
    maintenance: 1,
    totalTasks: 45,
    avgBattery: 76
  };

  useEffect(() => {
    const isAuth = localStorage.getItem('isAuthenticated');
    const storedUsername = localStorage.getItem('username');
    
    if (!isAuth || !storedUsername) {
      navigate('/');
    } else {
      setUsername(storedUsername);
    }
  }, [navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'status-active';
      case 'charging': return 'status-charging';
      case 'maintenance': return 'status-maintenance';
      default: return 'status-offline';
    }
  };

  const getBatteryColor = (battery) => {
    if (battery > 70) return 'battery-high';
    if (battery > 30) return 'battery-medium';
    return 'battery-low';
  };

  return (
    <div className="fleet-manager-container">
      <div className="fleet-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Dashboard
          </button>
          <div className="header-title">
            <h1>🚀 Fleet Manager</h1>
            <p className="subtitle">Monitor and manage your robot fleet in real-time</p>
          </div>
          <div className="user-badge">
            <span className="user-icon">👤</span>
            <span className="username">{username}</span>
          </div>
        </div>
      </div>

      <div className="fleet-content">
        {/* Fleet Statistics */}
        <div className="stats-overview">
          <div className="stat-box">
            <div className="stat-icon">🤖</div>
            <div className="stat-info">
              <h3>{fleetStats.total}</h3>
              <p>Total Robots</p>
            </div>
          </div>
          <div className="stat-box active">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{fleetStats.active}</h3>
              <p>Active</p>
            </div>
          </div>
          <div className="stat-box charging">
            <div className="stat-icon">🔋</div>
            <div className="stat-info">
              <h3>{fleetStats.charging}</h3>
              <p>Charging</p>
            </div>
          </div>
          <div className="stat-box maintenance">
            <div className="stat-icon">🔧</div>
            <div className="stat-info">
              <h3>{fleetStats.maintenance}</h3>
              <p>Maintenance</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{fleetStats.totalTasks}</h3>
              <p>Total Tasks</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">⚡</div>
            <div className="stat-info">
              <h3>{fleetStats.avgBattery}%</h3>
              <p>Avg Battery</p>
            </div>
          </div>
        </div>

        {/* Robot Fleet Grid */}
        <div className="fleet-grid">
          {fleetData.map((robot) => (
            <div 
              key={robot.id} 
              className={`robot-card ${selectedRobot?.id === robot.id ? 'selected' : ''}`}
              onClick={() => setSelectedRobot(robot)}
            >
              <div className="robot-card-header">
                <div className="robot-info">
                  <h3>{robot.name}</h3>
                  <span className="robot-id">{robot.id}</span>
                </div>
                <span className={`status-badge ${getStatusColor(robot.status)}`}>
                  {robot.status}
                </span>
              </div>

              <div className="robot-metrics">
                <div className="metric">
                  <span className="metric-label">Battery</span>
                  <div className="battery-bar">
                    <div 
                      className={`battery-fill ${getBatteryColor(robot.battery)}`}
                      style={{ width: `${robot.battery}%` }}
                    >
                      <span className="battery-text">{robot.battery}%</span>
                    </div>
                  </div>
                </div>

                <div className="metric">
                  <span className="metric-label">📍 Location</span>
                  <span className="metric-value">{robot.location}</span>
                </div>

                <div className="metric">
                  <span className="metric-label">📋 Tasks</span>
                  <span className="metric-value">{robot.tasks} active</span>
                </div>

                <div className="metric">
                  <span className="metric-label">🚀 Speed</span>
                  <span className="metric-value">{robot.speed} m/s</span>
                </div>

                <div className="metric">
                  <span className="metric-label">🌡️ Temp</span>
                  <span className="metric-value">{robot.temperature}°C</span>
                </div>

                <div className="metric">
                  <span className="metric-label">🕐 Last Active</span>
                  <span className="metric-value">{robot.lastActive}</span>
                </div>
              </div>

              <div className="robot-actions">
                <button className="action-btn view">View Details</button>
                <button className="action-btn control">Control</button>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Robot Details */}
        {selectedRobot && (
          <div className="robot-details-panel">
            <div className="panel-header">
              <h2>Robot Details: {selectedRobot.name}</h2>
              <button onClick={() => setSelectedRobot(null)} className="close-btn">✕</button>
            </div>
            <div className="panel-content">
              <div className="detail-section">
                <h3>System Information</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Robot ID:</span>
                    <span className="detail-value">{selectedRobot.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status:</span>
                    <span className={`detail-value ${getStatusColor(selectedRobot.status)}`}>
                      {selectedRobot.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Battery Level:</span>
                    <span className="detail-value">{selectedRobot.battery}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Location:</span>
                    <span className="detail-value">{selectedRobot.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Active Tasks:</span>
                    <span className="detail-value">{selectedRobot.tasks}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Current Speed:</span>
                    <span className="detail-value">{selectedRobot.speed} m/s</span>
                  </div>
                </div>
              </div>
              <div className="detail-actions">
                <button className="detail-action-btn primary">Send Command</button>
                <button className="detail-action-btn secondary">View Logs</button>
                <button className="detail-action-btn secondary">Schedule Maintenance</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FleetManager;
