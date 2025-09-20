import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../../../store/hooks';
import { logout } from '../../../../store/slices/authSlice';
import { 
  fetchNotifications, 
  markAllAsRead,
  markAsRead,
  Notification 
} from '../../../../store/slices/notificationsSlice';
import { searchDashboard, SearchResultItem } from '../../../../services/searchService';
import SearchResults from '../../../../components/SearchResults';
import './Header.scss';

// Icons
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
  </svg>
);

interface HeaderProps {
  showNotifications: boolean;
  setShowNotifications: (show: boolean) => void;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
}

// Helper function to format notification time
const formatNotificationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMs / 3600000);
  const diffDays = Math.round(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Helper function to get the appropriate icon based on notification type
const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 21H23L12 2L1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z" fill="currentColor"/>
        </svg>
      );
    case 'info':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
        </svg>
      );
    case 'success':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="currentColor"/>
        </svg>
      );
    case 'error':
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V11H13V17ZM13 9H11V7H13V9Z" fill="currentColor"/>
        </svg>
      );
  }
};

const Header: React.FC<HeaderProps> = ({ 
  showNotifications, 
  setShowNotifications, 
  showUserMenu, 
  setShowUserMenu 
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const notifications = useAppSelector(state => state.notifications);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch notifications when component mounts
  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      const results = searchDashboard(query);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };
  
  // Handle search result click
  const handleResultClick = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };
  
  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Command+K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }
      
      // Escape to clear search when focused
      if (e.key === 'Escape' && isSearchFocused) {
        handleClearSearch();
        searchInputRef.current?.blur();
        setIsSearchFocused(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchFocused]);
  
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      dispatch(markAsRead(notification._id));
    }
    
    // If notification has a link, navigate to it
    if (notification.link) {
      navigate(notification.link);
    }
    
    setShowNotifications(false);
  };

  // Handle mark all as read
  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent closing the dropdown
    dispatch(markAllAsRead());
  };
  
  return (
    <header className="dashboard-header">
      <div className="header-title">
        <h1>Armada Etijahat Console</h1>
      </div>
      <div className="header-actions">
        <div className={`search-bar ${isSearchFocused ? 'focused' : ''}`}>
          <SearchIcon />
          <input 
            ref={searchInputRef}
            type="text" 
            placeholder="Search dashboard... (Ctrl+K)" 
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
          />
          {searchQuery && (
            <button className="clear-button" onClick={handleClearSearch}>
              <ClearIcon />
            </button>
          )}
          {showSearchResults && (
            <SearchResults 
              results={searchResults}
              query={searchQuery}
              isVisible={showSearchResults}
              onClose={() => setShowSearchResults(false)}
              onResultClick={handleResultClick}
            />
          )}
        </div>
        <div className="header-buttons">
          <div className="notification-button" onClick={() => setShowNotifications(!showNotifications)}>
            <BellIcon />
            {notifications.unreadCount > 0 && (
              <span className="notification-badge">{notifications.unreadCount}</span>
            )}
            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button onClick={handleMarkAllAsRead}>Mark all as read</button>
                </div>
                <div className="notification-list">
                  {notifications.isLoading ? (
                    <div className="notification-loading">Loading notifications...</div>
                  ) : notifications.error ? (
                    <div className="notification-error">Error loading notifications: {notifications.error}</div>
                  ) : notifications.notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                  ) : (
                    notifications.notifications.slice(0, 5).map((notification) => (
                      <div 
                        key={notification._id} 
                        className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className={`notification-icon ${notification.type}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <div className="notification-title">{notification.title}</div>
                          <div className="notification-description">{notification.message}</div>
                          <div className="notification-time">{formatNotificationTime(notification.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="notification-footer">
                  <button onClick={() => {
                    navigate('/dashboard/notifications');
                    setShowNotifications(false);
                  }}>View all notifications</button>
                </div>
              </div>
            )}
          </div>
          <div className="user-profile" onClick={() => setShowUserMenu(!showUserMenu)}>
            <div className="user-avatar">
              <UserIcon />
            </div>
            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-name">{user ? `${user.firstName} ${user.lastName}` : 'Guest User'}</div>
                  <div className="user-email">{user ? user.email : 'guest@armada.com'}</div>
                </div>
                <div className="user-menu">
                  <div className="user-menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="currentColor"/>
                    </svg>
                    <span>Profile</span>
                  </div>
                  <div className="user-menu-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.14 12.94C19.18 12.64 19.2 12.33 19.2 12C19.2 11.68 19.18 11.36 19.13 11.06L21.16 9.48C21.34 9.34 21.39 9.07 21.28 8.87L19.36 5.55C19.24 5.33 18.99 5.26 18.77 5.33L16.38 6.29C15.88 5.91 15.35 5.59 14.76 5.35L14.4 2.81C14.36 2.57 14.16 2.4 13.92 2.4H10.08C9.84 2.4 9.65 2.57 9.61 2.81L9.25 5.35C8.66 5.59 8.12 5.92 7.63 6.29L5.24 5.33C5.02 5.25 4.77 5.33 4.65 5.55L2.74 8.87C2.62 9.08 2.66 9.34 2.86 9.48L4.89 11.06C4.84 11.36 4.8 11.69 4.8 12C4.8 12.31 4.82 12.64 4.87 12.94L2.84 14.52C2.66 14.66 2.61 14.93 2.72 15.13L4.64 18.45C4.76 18.67 5.01 18.74 5.23 18.67L7.62 17.71C8.12 18.09 8.65 18.41 9.24 18.65L9.6 21.19C9.65 21.43 9.84 21.6 10.08 21.6H13.92C14.16 21.6 14.36 21.43 14.39 21.19L14.75 18.65C15.34 18.41 15.88 18.09 16.37 17.71L18.76 18.67C18.98 18.75 19.23 18.67 19.35 18.45L21.27 15.13C21.39 14.91 21.34 14.66 21.15 14.52L19.14 12.94ZM12 15.6C10.02 15.6 8.4 13.98 8.4 12C8.4 10.02 10.02 8.4 12 8.4C13.98 8.4 15.6 10.02 15.6 12C15.6 13.98 13.98 15.6 12 15.6Z" fill="currentColor"/>
                    </svg>
                    <span>Settings</span>
                  </div>
                  <div className="user-menu-item" onClick={handleLogout}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 7L15.59 8.41L18.17 11H8V13H18.17L15.59 15.58L17 17L22 12L17 7ZM4 5H12V3H4C2.9 3 2 3.9 2 5V19C2 20.1 2.9 21 4 21H12V19H4V5Z" fill="currentColor"/>
                    </svg>
                    <span>Logout</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
