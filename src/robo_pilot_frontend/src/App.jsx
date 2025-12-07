import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './login.jsx'
import Dashboard from './Dashboard.jsx'
import Settings from './Settings.jsx'
import RobotChat from './RobotChat.jsx'
import FleetManager from './FleetManager.jsx'
import OrchestrationManager from './OrchestrationManager.jsx'

function App() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch CSRF token on app load
    const fetchCsrfToken = async () => {
      try {
        await fetch('http://localhost:8000/api/csrf/', {
          credentials: 'include',
        });
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    return isAuthenticated ? children : <Navigate to="/" replace />;
  };

  // Public Route (redirect to dashboard if already logged in)
  const PublicRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
  };

  return (
    <div className="app-container">
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <RobotChat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fleet" 
          element={
            <ProtectedRoute>
              <FleetManager />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/orchestration" 
          element={
            <ProtectedRoute>
              <OrchestrationManager />
            </ProtectedRoute>
          } 
        />
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
