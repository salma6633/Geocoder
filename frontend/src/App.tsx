import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAppDispatch } from './store/hooks';
import { getCurrentUser } from './store/slices/authSlice';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import APIKeys from './pages/APIKeys';
import Usage from './pages/Usage';
import Logs from './pages/Logs';
import Sandbox from './pages/Sandbox';
import Notifications from './pages/Notifications';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

const App: React.FC = () => {
  const dispatch = useAppDispatch();

  // Check if user is authenticated on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard/*" element={<Dashboard />} />
            <Route path="/api-keys" element={<APIKeys />} />
            <Route path="/usage" element={<Usage />} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/sandbox" element={<Sandbox />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/notifications/:id" element={<Notifications />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;
