import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrchestrationManager.css';

function OrchestrationManager() {
  const [username, setUsername] = useState('');
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [activeTab, setActiveTab] = useState('workflows');
  const navigate = useNavigate();

  // Dummy workflow data
  const workflows = [
    {
      id: 'WF-001',
      name: 'Warehouse Patrol Route',
      status: 'running',
      robots: ['ROB-001', 'ROB-002'],
      progress: 75,
      startTime: '10:30 AM',
      estimatedCompletion: '2:45 PM',
      priority: 'high',
      tasks: 15,
      completedTasks: 11
    },
    {
      id: 'WF-002',
      name: 'Inventory Check - Zone A',
      status: 'running',
      robots: ['ROB-004'],
      progress: 45,
      startTime: '11:00 AM',
      estimatedCompletion: '3:30 PM',
      priority: 'medium',
      tasks: 20,
      completedTasks: 9
    },
    {
      id: 'WF-003',
      name: 'Package Delivery Circuit',
      status: 'scheduled',
      robots: ['ROB-006'],
      progress: 0,
      startTime: '2:00 PM',
      estimatedCompletion: '5:00 PM',
      priority: 'high',
      tasks: 25,
      completedTasks: 0
    },
    {
      id: 'WF-004',
      name: 'Floor Cleaning Routine',
      status: 'completed',
      robots: ['ROB-002', 'ROB-003'],
      progress: 100,
      startTime: '8:00 AM',
      estimatedCompletion: '10:00 AM',
      priority: 'low',
      tasks: 10,
      completedTasks: 10
    },
    {
      id: 'WF-005',
      name: 'Security Sweep',
      status: 'paused',
      robots: ['ROB-001'],
      progress: 60,
      startTime: '9:30 AM',
      estimatedCompletion: '1:00 PM',
      priority: 'high',
      tasks: 12,
      completedTasks: 7
    }
  ];

  // Dummy task queue data
  const taskQueue = [
    { id: 'T-101', name: 'Transport Item to Zone B', robot: 'ROB-001', priority: 'high', eta: '5 mins' },
    { id: 'T-102', name: 'Scan Inventory Section C', robot: 'ROB-004', priority: 'medium', eta: '12 mins' },
    { id: 'T-103', name: 'Navigate to Charging Station', robot: 'ROB-003', priority: 'low', eta: '20 mins' },
    { id: 'T-104', name: 'Pick up Package #4521', robot: 'ROB-006', priority: 'high', eta: '8 mins' },
    { id: 'T-105', name: 'Patrol Perimeter Route', robot: 'ROB-002', priority: 'medium', eta: '15 mins' }
  ];

  // Dummy schedule data
  const schedule = [
    { time: '14:00', workflow: 'Package Delivery Circuit', robots: 1, status: 'scheduled' },
    { time: '15:30', workflow: 'Maintenance Check - All Units', robots: 6, status: 'scheduled' },
    { time: '16:00', workflow: 'Evening Patrol Shift', robots: 2, status: 'scheduled' },
    { time: '17:00', workflow: 'Data Synchronization', robots: 6, status: 'scheduled' },
    { time: '18:00', workflow: 'Night Security Protocol', robots: 3, status: 'scheduled' }
  ];

  const orchestrationStats = {
    activeWorkflows: 2,
    scheduledWorkflows: 1,
    completedToday: 8,
    tasksInQueue: 5,
    avgCompletionTime: '2.5h',
    successRate: 94
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
      case 'running': return 'status-running';
      case 'scheduled': return 'status-scheduled';
      case 'completed': return 'status-completed';
      case 'paused': return 'status-paused';
      default: return 'status-failed';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="orchestration-manager-container">
      <div className="orchestration-header">
        <div className="header-content">
          <button onClick={() => navigate('/dashboard')} className="back-button">
            ← Dashboard
          </button>
          <div className="header-title">
            <h1>⚙️ Orchestration Manager</h1>
            <p className="subtitle">Coordinate and manage robot workflows and task execution</p>
          </div>
          <div className="user-badge">
            <span className="user-icon">👤</span>
            <span className="username">{username}</span>
          </div>
        </div>
      </div>

      <div className="orchestration-content">
        {/* Orchestration Statistics */}
        <div className="stats-overview">
          <div className="stat-box running">
            <div className="stat-icon">▶️</div>
            <div className="stat-info">
              <h3>{orchestrationStats.activeWorkflows}</h3>
              <p>Active Workflows</p>
            </div>
          </div>
          <div className="stat-box scheduled">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{orchestrationStats.scheduledWorkflows}</h3>
              <p>Scheduled</p>
            </div>
          </div>
          <div className="stat-box completed">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{orchestrationStats.completedToday}</h3>
              <p>Completed Today</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h3>{orchestrationStats.tasksInQueue}</h3>
              <p>Tasks in Queue</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">⏱️</div>
            <div className="stat-info">
              <h3>{orchestrationStats.avgCompletionTime}</h3>
              <p>Avg Completion</p>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon">📈</div>
            <div className="stat-info">
              <h3>{orchestrationStats.successRate}%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'workflows' ? 'active' : ''}`}
            onClick={() => setActiveTab('workflows')}
          >
            Workflows
          </button>
          <button 
            className={`tab-btn ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            Task Queue
          </button>
          <button 
            className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule
          </button>
        </div>

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <div className="workflows-grid">
            {workflows.map((workflow) => (
              <div 
                key={workflow.id} 
                className={`workflow-card ${selectedWorkflow?.id === workflow.id ? 'selected' : ''}`}
                onClick={() => setSelectedWorkflow(workflow)}
              >
                <div className="workflow-header">
                  <div className="workflow-info">
                    <h3>{workflow.name}</h3>
                    <span className="workflow-id">{workflow.id}</span>
                  </div>
                  <span className={`status-badge ${getStatusColor(workflow.status)}`}>
                    {workflow.status}
                  </span>
                </div>

                <div className="workflow-progress">
                  <div className="progress-info">
                    <span>Progress</span>
                    <span className="progress-percentage">{workflow.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${workflow.progress}%` }}
                    />
                  </div>
                </div>

                <div className="workflow-details">
                  <div className="detail-item">
                    <span className="detail-label">🤖 Robots:</span>
                    <span className="detail-value">{workflow.robots.length}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">📋 Tasks:</span>
                    <span className="detail-value">{workflow.completedTasks}/{workflow.tasks}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">⏰ Started:</span>
                    <span className="detail-value">{workflow.startTime}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🎯 ETA:</span>
                    <span className="detail-value">{workflow.estimatedCompletion}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Priority:</span>
                    <span className={`priority-badge ${getPriorityColor(workflow.priority)}`}>
                      {workflow.priority}
                    </span>
                  </div>
                </div>

                <div className="workflow-actions">
                  {workflow.status === 'running' && (
                    <>
                      <button className="action-btn pause">Pause</button>
                      <button className="action-btn stop">Stop</button>
                    </>
                  )}
                  {workflow.status === 'paused' && (
                    <>
                      <button className="action-btn resume">Resume</button>
                      <button className="action-btn stop">Stop</button>
                    </>
                  )}
                  {workflow.status === 'scheduled' && (
                    <>
                      <button className="action-btn start">Start Now</button>
                      <button className="action-btn cancel">Cancel</button>
                    </>
                  )}
                  {workflow.status === 'completed' && (
                    <button className="action-btn view">View Report</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Task Queue Tab */}
        {activeTab === 'queue' && (
          <div className="task-queue-container">
            <div className="queue-header">
              <h2>Task Queue ({taskQueue.length} pending)</h2>
              <button className="add-task-btn">+ Add Task</button>
            </div>
            <div className="task-list">
              {taskQueue.map((task) => (
                <div key={task.id} className="task-item">
                  <div className="task-main">
                    <span className={`priority-indicator ${getPriorityColor(task.priority)}`}></span>
                    <div className="task-info">
                      <h4>{task.name}</h4>
                      <span className="task-id">{task.id}</span>
                    </div>
                  </div>
                  <div className="task-meta">
                    <span className="task-robot">🤖 {task.robot}</span>
                    <span className={`task-priority ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className="task-eta">⏱️ {task.eta}</span>
                  </div>
                  <div className="task-actions">
                    <button className="task-action-btn edit">Edit</button>
                    <button className="task-action-btn remove">Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="schedule-container">
            <div className="schedule-header">
              <h2>Today's Schedule</h2>
              <button className="add-schedule-btn">+ Schedule Workflow</button>
            </div>
            <div className="schedule-timeline">
              {schedule.map((item, index) => (
                <div key={index} className="schedule-item">
                  <div className="schedule-time">{item.time}</div>
                  <div className="schedule-content">
                    <h4>{item.workflow}</h4>
                    <div className="schedule-meta">
                      <span>🤖 {item.robots} robot{item.robots > 1 ? 's' : ''}</span>
                      <span className={`schedule-status ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                  <div className="schedule-actions">
                    <button className="schedule-action-btn">Edit</button>
                    <button className="schedule-action-btn">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrchestrationManager;
