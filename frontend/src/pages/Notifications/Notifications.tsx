import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchNotifications, 
  fetchNotificationById,
  markAsRead, 
  markAllAsRead,
  clearSelectedNotification,
  setFilters,
  clearFilters,
  Notification
} from '../../store/slices/notificationsSlice';
import './Notifications.scss';

// Icons
const SuccessIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
  </svg>
);

const ErrorIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
  </svg>
);

const WarningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="currentColor"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
  </svg>
);

// Removed unused BackIcon

const FilterIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18H14V16H10V18ZM3 6V8H21V6H3ZM6 13H18V11H6V13Z" fill="currentColor"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="currentColor"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="currentColor"/>
  </svg>
);

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'success':
      return <SuccessIcon />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <WarningIcon />;
    case 'info':
    default:
      return <InfoIcon />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(date);
};

const NotificationsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { id } = useParams<{ id?: string }>();
  const { notifications, selectedNotification, unreadCount, isLoading, error, filters } = useAppSelector(state => state.notifications);
  const [selectedType, setSelectedType] = useState<string>(filters.type || 'all');
  const [selectedReadStatus, setSelectedReadStatus] = useState<string | boolean>(filters.isRead || 'all');

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(fetchNotificationById(id));
      // Mark as read when viewing a specific notification
      dispatch(markAsRead(id));
    } else {
      dispatch(clearSelectedNotification());
    }
  }, [dispatch, id]);

  // Removed unused navigation functions

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
  };

  // Removed unused handleApplyFilters function

  const handleResetFilters = () => {
    setSelectedType('all');
    setSelectedReadStatus('all');
    dispatch(clearFilters());
  };

  const filteredNotifications = notifications.filter(notification => {
    // Filter by type
    if (filters.type && filters.type !== 'all' && notification.type !== filters.type) {
      return false;
    }
    
    // Filter by read status
    if (filters.isRead !== 'all') {
      if (filters.isRead === true && !notification.isRead) return false;
      if (filters.isRead === false && notification.isRead) return false;
    }
    
    return true;
  });

  const handleViewNotification = async (notification: Notification) => {
    try {
      // Mark notification as read and wait for it to complete
      if (!notification.isRead) {
        await dispatch(markAsRead(notification._id)).unwrap();
      }
      
      // Fetch notification details
      await dispatch(fetchNotificationById(notification._id)).unwrap();
      
      // Show modal after both operations complete
      setShowDetailModal(true);
      
      // Refresh notifications list to update UI
      dispatch(fetchNotifications());
    } catch (error) {
      console.error('Error handling notification view:', error);
    }
  };
  
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Render notifications list view
  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div className="notifications-title">
          <h1>Notifications</h1>
          <p>View and manage your system notifications</p>
        </div>
      </div>

      <div className="notifications-content">
        <div className="notifications-actions">
          {unreadCount > 0 && (
            <button 
              className="btn-mark-all-read"
              onClick={handleMarkAllAsRead}
            >
              <CheckIcon /> Mark all as read
            </button>
          )}
          
          <div className="notifications-filters">
            <div className="filter-container">
              <FilterIcon />
              <select 
                value={selectedType} 
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  dispatch(setFilters({
                    type: e.target.value as 'success' | 'error' | 'warning' | 'info' | 'all',
                    isRead: filters.isRead
                  }));
                }}
              >
                <option value="all">All types</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            
            <div className="filter-container">
              <FilterIcon />
              <select 
                value={selectedReadStatus === 'all' ? 'all' : selectedReadStatus === true ? 'read' : 'unread'} 
                onChange={(e) => {
                  const value = e.target.value;
                  const isReadValue = value === 'all' ? 'all' : value === 'read' ? true : false;
                  setSelectedReadStatus(isReadValue);
                  dispatch(setFilters({
                    type: filters.type,
                    isRead: isReadValue
                  }));
                }}
              >
                <option value="all">All statuses</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
              </select>
            </div>
            
            <button 
              className="btn-reset-filters"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">Error loading notifications: {error}</p>
            <button 
              className="btn-retry"
              onClick={() => dispatch(fetchNotifications())}
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="notifications-table-container">
            <table className="notifications-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map(notification => (
                  <motion.tr 
                    key={notification._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`status-${notification.isRead ? 'read' : 'unread'}`}
                    onClick={() => handleViewNotification(notification)}
                  >
                    <td className="notification-type-cell">
                      <span className={`type-icon ${notification.type}`}>
                        {getNotificationIcon(notification.type)}
                      </span>
                    </td>
                    <td className="notification-title">{notification.title}</td>
                    <td className="notification-message">{notification.message.length > 80 ? `${notification.message.substring(0, 80)}...` : notification.message}</td>
                    <td>{formatDate(notification.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${notification.isRead ? 'read' : 'unread'}`}>
                        {notification.isRead ? 'Read' : 'Unread'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            
            {filteredNotifications.length === 0 && (
              <div className="no-results">
                <p>No notifications found matching your filters</p>
                {(filters.type !== 'all' || filters.isRead !== 'all') && (
                  <button className="btn-reset-filters" onClick={handleResetFilters}>
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Notification Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedNotification && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content notification-detail-modal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <div className={`modal-header ${selectedNotification.type}`}>
                <div className="notification-icon">
                  {getNotificationIcon(selectedNotification.type)}
                </div>
                <h2>{selectedNotification.title}</h2>
                <button 
                  className="btn-close" 
                  onClick={() => setShowDetailModal(false)}
                >
                  <CloseIcon />
                </button>
              </div>
              
              <div className="modal-body">
                <div className="notification-meta">
                  <span className="notification-date">{formatDate(selectedNotification.createdAt)}</span>
                  <span className={`notification-type-badge ${selectedNotification.type}`}>
                    {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                  </span>
                </div>
                
                <div className="notification-content">
                  <p className="notification-message">{selectedNotification.message}</p>
                  
                  {selectedNotification.content && (
                    <div className="notification-html-content" dangerouslySetInnerHTML={{ __html: selectedNotification.content }} />
                  )}
                  
                  {selectedNotification.image && (
                    <div className="notification-image">
                      <img src={selectedNotification.image} alt={selectedNotification.title} />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="modal-footer">
                {selectedNotification.link && (
                  <a 
                    href={selectedNotification.link} 
                    className="btn-primary"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Learn More
                  </a>
                )}
                <button 
                  className="btn-secondary"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPage;
