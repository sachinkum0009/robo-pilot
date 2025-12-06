import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

function Dashboard() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

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
  }, [navigate]);

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
