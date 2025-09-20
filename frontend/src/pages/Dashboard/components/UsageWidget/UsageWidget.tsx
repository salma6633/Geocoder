import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../store/hooks';
import { fetchUsageData } from '../../../../store/slices/usageSlice';
import './UsageWidget.scss';

// Icons
const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="currentColor"/>
  </svg>
);

// Loading spinner component
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <svg width="40" height="40" viewBox="0 0 50 50">
      <circle cx="25" cy="25" r="20" fill="none" stroke="#4285f4" strokeWidth="5" strokeLinecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          dur="1s"
          from="0 25 25"
          to="360 25 25"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  </div>
);

const UsageWidget: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data: usageData, isLoading } = useAppSelector(state => state.usage);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Fetch data if not already loaded
  useEffect(() => {
    if (!usageData) {
      dispatch(fetchUsageData('7days'));
    }
  }, [dispatch, usageData]);
  
  // Handle refresh button click
  const handleRefresh = () => {
    setIsRefreshing(true);
    dispatch(fetchUsageData('7days')).finally(() => {
      setIsRefreshing(false);
    });
  };
  
  // Render loading state
  if (isLoading && !usageData) {
    return (
      <div className="dashboard-widget usage-widget">
        <div className="widget-header">
          <h3>API Usage</h3>
          <div className="widget-actions">
            <button className="icon-button loading" disabled>
              <RefreshIcon />
            </button>
            <button className="icon-button" disabled>
              <MoreIcon />
            </button>
          </div>
        </div>
        <div className="widget-content loading-content">
          <LoadingSpinner />
        </div>
      </div>
    );
  }
  
  // Format numbers with K/M suffix
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  // Get request history data for chart
  const getRequestHistory = () => {
    if (!usageData || !usageData.requests.history || usageData.requests.history.length === 0) {
      return [];
    }
    return usageData.requests.history;
  };
  
  // Get max value for chart scaling
  const getMaxRequestValue = () => {
    const history = getRequestHistory();
    if (history.length === 0) {
      return 100000; // Default max value if no data
    }
    
    const max = Math.max(...history.map(day => day.success + day.failed));
    return max > 0 ? max : 100000; // Ensure we don't have a zero max value
  };
  
  // Render chart bars
  const renderChartBars = () => {
    const history = getRequestHistory();
    
    if (history.length === 0) {
      // Return placeholder bars if no data
      return Array(7).fill(0).map((_, index) => {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        return (
          <div className="chart-bar" key={index}>
            <div className="bar-fill" style={{ height: '0%' }}></div>
            <div className="bar-label">{days[index]}</div>
          </div>
        );
      });
    }
    
    const maxValue = getMaxRequestValue();
    
    return history.map((day, index) => {
      const totalRequests = day.success + day.failed;
      const height = maxValue > 0 ? (totalRequests / maxValue) * 100 : 0;
      const date = new Date(day.date);
      const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 3);
      
      return (
        <div className="chart-bar" key={index}>
          <div 
            className="bar-fill" 
            style={{ height: `${height}%` }}
            title={`${totalRequests.toLocaleString()} requests on ${date.toLocaleDateString()}`}
          ></div>
          <div className="bar-label">{dayLabel}</div>
        </div>
      );
    });
  };
  
  // Get stats for the widget
  const getStats = () => {
    if (!usageData) {
      return {
        totalRequests: '0',
        totalChange: '+0.0%',
        successRate: '0%',
        successChange: '+0.0%',
        avgResponseTime: '0ms',
        responseChange: '0ms'
      };
    }
    
    // Get total requests
    const totalRequests = usageData.requests.total;
    
    // Get success rate
    const successRate = usageData.requests.successRate;
    
    // Calculate week-over-week changes (if available in the API)
    // For now, we'll use placeholder values that would normally come from the API
    const totalChange = '+0.0%';
    const successChange = '+0.0%';
    
    // Get average response time from models
    let avgResponseTime = 0;
    if (usageData.models && usageData.models.length > 0) {
      avgResponseTime = Math.round(
        usageData.models.reduce((sum, model) => sum + model.avgResponseTime, 0) / 
        usageData.models.length
      );
    }
    
    // Response time change (placeholder)
    const responseChange = '0ms';
    
    return {
      totalRequests: formatNumber(totalRequests),
      totalChange,
      successRate: `${successRate}%`,
      successChange,
      avgResponseTime: `${avgResponseTime}ms`,
      responseChange
    };
  };
  
  const stats = getStats();
  
  return (
    <div className="dashboard-widget usage-widget">
      <div className="widget-header">
        <h3>API Usage</h3>
        <div className="widget-actions">
          <button 
            className={`icon-button ${isRefreshing || isLoading ? 'loading' : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
          >
            <RefreshIcon />
          </button>
          <button className="icon-button">
            <MoreIcon />
          </button>
        </div>
      </div>
      <div className="widget-content">
        <div className="usage-chart">
          <div className="chart-container">
            <div className="chart-labels">
              <div className="chart-label">{formatNumber(getMaxRequestValue())}</div>
              <div className="chart-label">{formatNumber(getMaxRequestValue() * 0.75)}</div>
              <div className="chart-label">{formatNumber(getMaxRequestValue() * 0.5)}</div>
              <div className="chart-label">{formatNumber(getMaxRequestValue() * 0.25)}</div>
              <div className="chart-label">0</div>
            </div>
            <div className="chart-bars">
              {renderChartBars()}
            </div>
          </div>
        </div>
        <div className="usage-stats">
          <div className="stat-item">
            <div className="stat-label">Total Requests</div>
            <div className="stat-value">{stats.totalRequests}</div>
            <div className={`stat-change ${stats.totalChange.startsWith('+') ? 'positive' : 'negative'}`}>
              {stats.totalChange} from last week
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Success Rate</div>
            <div className="stat-value">{stats.successRate}</div>
            <div className={`stat-change ${stats.successChange.startsWith('+') ? 'positive' : 'negative'}`}>
              {stats.successChange} from last week
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Avg. Response Time</div>
            <div className="stat-value">{stats.avgResponseTime}</div>
            <div className={`stat-change ${stats.responseChange.startsWith('-') ? 'positive' : 'negative'}`}>
              {stats.responseChange} from last week
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageWidget;
