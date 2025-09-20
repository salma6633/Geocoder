import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchApiKeys } from '../../store/slices/apiKeySlice';
import { fetchUsageData } from '../../store/slices/usageSlice';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import UsageWidget from './components/UsageWidget';
import QuickActionsWidget from './components/QuickActionsWidget';
import BillingWidget from './components/BillingWidget';
import APIKeys from '../APIKeys';
import Usage from '../Usage';
import Logs from '../Logs';
import Sandbox from '../Sandbox';
import Notifications from '../Notifications';
import './Dashboard.scss';

// Icons

const BillingIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4C2.89 4 2.01 4.89 2.01 6L2 18C2 19.11 2.89 20 4 20H20C21.11 20 22 19.11 22 18V6C22 4.89 21.11 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z" fill="currentColor"/>
  </svg>
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;
  
  // Get data from Redux store
  const { apiKeys } = useAppSelector(state => state.apiKeys);
  const { data: usageData } = useAppSelector(state => state.usage);
  const { user } = useAppSelector(state => state.auth);
  
  // Fetch data when component mounts or when returning to dashboard home
  useEffect(() => {
    dispatch(fetchApiKeys());
    dispatch(fetchUsageData('7days'));
  }, [dispatch]);
  
  // Refresh data when navigating back to dashboard home
  useEffect(() => {
    if (path === '/dashboard' || path === '/dashboard/') {
      dispatch(fetchUsageData('7days'));
    }
  }, [dispatch, path]);
  
  // Determine active nav based on current path
  const getActiveNav = () => {
    if (path.includes('/dashboard/api-keys')) return 'api-keys';
    if (path.includes('/dashboard/usage')) return 'usage';
    if (path.includes('/dashboard/logs')) return 'logs';
    if (path.includes('/dashboard/notifications')) return 'notifications';
    if (path.includes('/dashboard/sandbox')) return 'sandbox';
    if (path.includes('/dashboard/billing')) return 'billing';
    if (path.includes('/dashboard/docs')) return 'docs';
    if (path.includes('/dashboard/settings')) return 'settings';
    return 'dashboard';
  };
  
  const [activeNav, setActiveNav] = useState(getActiveNav());
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Update active nav when path changes
  useEffect(() => {
    setActiveNav(getActiveNav());
  }, [path]);

  // Handle navigation when sidebar item is clicked
  const handleNavChange = (nav: string) => {
    setActiveNav(nav);
    
    switch(nav) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'api-keys':
        navigate('/dashboard/api-keys');
        break;
      case 'usage':
        navigate('/dashboard/usage');
        break;
      case 'logs':
        navigate('/dashboard/logs');
        break;
      case 'notifications':
        navigate('/dashboard/notifications');
        break;
      case 'sandbox':
        navigate('/dashboard/sandbox');
        break;
      case 'billing':
        navigate('/dashboard/billing');
        break;
      case 'docs':
        navigate('/dashboard/docs');
        break;
      case 'settings':
        navigate('/dashboard/settings');
        break;
      default:
        navigate('/dashboard');
    }
  };

  // Get summary stats for welcome section
  const getSummaryStats = () => {
    if (!usageData) return {
      totalRequests: '0',
      successRate: '0%',
      creditsUsed: '0',
      activeKeys: 0
    };
    
    return {
      totalRequests: usageData.requests.total.toLocaleString(),
      successRate: `${usageData.requests.successRate}%`,
      creditsUsed: usageData.credits.used.toLocaleString(),
      activeKeys: apiKeys.filter(key => key.status === 'active').length
    };
  };
  
  const stats = getSummaryStats();
  
  // Get username from user object
  const getUserName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} setActiveNav={handleNavChange} />

      {/* Main content */}
      <main className="dashboard-main">
        {/* Header */}
        <Header 
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          showUserMenu={showUserMenu}
          setShowUserMenu={setShowUserMenu}
        />

        {/* Dashboard content */}
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={
              <AnimatePresence mode="wait">
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Welcome section */}
                  <div className="dashboard-welcome">
                    <h2>Welcome back, {getUserName()}</h2>
                    <p>Here's an overview of your API usage and account status</p>
                    
                    <div className="welcome-stats">
                      <div className="stat-item">
                        <div className="stat-value">{stats.totalRequests}</div>
                        <div className="stat-label">Total Requests (7 days)</div>
                      </div>
                      <div className="stat-item success">
                        <div className="stat-value">{stats.successRate}</div>
                        <div className="stat-label">Success Rate</div>
                      </div>
                      <div className="stat-item warning">
                        <div className="stat-value">{stats.creditsUsed}</div>
                        <div className="stat-label">Credits Used</div>
                      </div>
                      <div className="stat-item">
                        <div className="stat-value">{stats.activeKeys}</div>
                        <div className="stat-label">Active API Keys</div>
                      </div>
                    </div>
                  </div>
                
                  {/* Top row */}
                  <div className="dashboard-row row-2-1">
                    <UsageWidget />
                    <QuickActionsWidget />
                  </div>

  

                  {/* Bottom row */}
                  <div className="dashboard-row row-1-1">

                    
                    <div className="dashboard-widget widget-warning">
                      <div className="widget-header">
                        <h3>
                          <span className="widget-icon"><BillingIcon /></span>
                          Billing Overview
                        </h3>
                        <div className="widget-actions">
                          <button className="btn btn-warning btn-sm" onClick={() => navigate('/dashboard/billing')}>
                            Billing Details
                          </button>
                        </div>
                      </div>
                      <div className="widget-content">
                        <BillingWidget />
                      </div>
                      <div className="widget-footer">
                        <div className="footer-text">
                          Next invoice: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="footer-actions">
                          <button className="btn btn-text btn-sm" onClick={() => navigate('/dashboard/billing')}>
                            Payment Methods
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            } />
            <Route path="/api-keys" element={<APIKeys />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notifications/:id" element={<Notifications />} />
            <Route path="/sandbox" element={<Sandbox />} />
            {/* Add other routes as they are created */}
            <Route path="*" element={<div className="dashboard-message">Page not found</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
