import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './Usage.scss';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchUsageData, setTimeRange } from '../../store/slices/usageSlice';

// Icons
const RefreshIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" fill="currentColor"/>
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/>
  </svg>
);

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
    <p>Loading usage data...</p>
  </div>
);

const Usage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading, error, timeRange } = useAppSelector((state) => state.usage);
  const [expandedSection, setExpandedSection] = useState<string | null>('credits');
  
  // Fetch usage data when component mounts or timeRange changes
  useEffect(() => {
    dispatch(fetchUsageData(timeRange));
  }, [dispatch, timeRange]);
  
  const handleTimeRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setTimeRange(e.target.value as '7days' | '30days' | '90days' | 'custom'));
  };
  
  const handleRefresh = () => {
    dispatch(fetchUsageData(timeRange));
  };
  
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  // Show loading state
  if (isLoading && !data) {
    return (
      <div className="usage-page">
        <div className="usage-header">
          <div className="usage-title">
            <h1>Usage & Limits</h1>
            <p>Monitor your API usage, credits, and account limits</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="usage-page">
        <div className="usage-header">
          <div className="usage-title">
            <h1>Usage & Limits</h1>
            <p>Monitor your API usage, credits, and account limits</p>
          </div>
        </div>
        <div className="error-message">
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button className="btn-refresh" onClick={handleRefresh}>
            <RefreshIcon /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // If no data yet, show loading
  if (!data) {
    return (
      <div className="usage-page">
        <div className="usage-header">
          <div className="usage-title">
            <h1>Usage & Limits</h1>
            <p>Monitor your API usage, credits, and account limits</p>
          </div>
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="usage-page">
      <div className="usage-header">
        <div className="usage-title">
          <h1>Usage & Limits</h1>
          <p>Monitor your API usage, credits, and account limits</p>
        </div>
        <div className="usage-actions">
          <div className="time-range-selector">
            <CalendarIcon />
            <select 
              value={timeRange} 
              onChange={handleTimeRangeChange}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          <button className="btn-refresh" onClick={handleRefresh}>
            <RefreshIcon /> Refresh
            {isLoading && <span className="loading-dot"></span>}
          </button>
          <button className="btn-download">
            <DownloadIcon /> Export
          </button>
        </div>
      </div>

      <div className="usage-content">
        {/* Credits Overview Card */}
        <div className="usage-card credits-overview">
          <div className="card-header" onClick={() => toggleSection('credits')}>
            <h2>Credits Overview</h2>
            <button className={`btn-expand ${expandedSection === 'credits' ? 'expanded' : ''}`}>
              <ChevronDownIcon />
            </button>
          </div>
          
          <motion.div 
            className="card-content"
            initial={false}
            animate={{ height: expandedSection === 'credits' ? 'auto' : '280px' }}
            transition={{ duration: 0.3 }}
          >
            <div className="credits-summary">
              <div className="credits-meter">
                <div className="meter-visual">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      fill="none" 
                      stroke="#e0e0e0" 
                      strokeWidth="12"
                    />
                    <circle 
                      cx="80" 
                      cy="80" 
                      r="70" 
                      fill="none" 
                      stroke="url(#creditGradient)" 
                      strokeWidth="12"
                      strokeDasharray="439.8"
                      strokeDashoffset={439.8 - (439.8 * data.credits.percentUsed / 100)}
                      transform="rotate(-90 80 80)"
                    />
                    <defs>
                      <linearGradient id="creditGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4285f4" />
                        <stop offset="100%" stopColor="#34a853" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="meter-content">
                    <div className="meter-percentage">{data.credits.percentUsed}%</div>
                    <div className="meter-label">Used</div>
                  </div>
                </div>
                <div className="meter-details">
                  <div className="meter-detail">
                    <div className="detail-label">Total Credits</div>
                    <div className="detail-value">{data.credits.total.toLocaleString()}</div>
                  </div>
                  <div className="meter-detail">
                    <div className="detail-label">Used Credits</div>
                    <div className="detail-value">{data.credits.used.toLocaleString()}</div>
                  </div>
                  <div className="meter-detail">
                    <div className="detail-label">Remaining</div>
                    <div className="detail-value">{data.credits.remaining.toLocaleString()}</div>
                  </div>
                  <div className="meter-detail">
                    <div className="detail-label">Refreshes On</div>
                    <div className="detail-value">{data.credits.refreshDate}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {expandedSection === 'credits' && data.credits.history && data.credits.history.length > 0 && (
              <div className="credits-history">
                <h3>Daily Credit Usage</h3>
                <div className="history-chart">
                  {data.credits.history.map((day, index) => {
                    const maxValue = Math.max(...data.credits.history.map(d => d.value));
                    const heightPercentage = maxValue > 0 ? (day.value / maxValue) * 100 : 0;
                    
                    return (
                      <div className="chart-column" key={index}>
                        <div className="chart-bar-container">
                          <div 
                            className="chart-bar" 
                            style={{ height: `${heightPercentage}%` }}
                          >
                            <div className="bar-tooltip">{day.value} credits</div>
                          </div>
                        </div>
                        <div className="chart-label">{day.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Requests Overview Card */}
        <div className="usage-card requests-overview">
          <div className="card-header" onClick={() => toggleSection('requests')}>
            <h2>Requests Overview</h2>
            <button className={`btn-expand ${expandedSection === 'requests' ? 'expanded' : ''}`}>
              <ChevronDownIcon />
            </button>
          </div>
          
          <motion.div 
            className="card-content"
            initial={false}
            animate={{ height: expandedSection === 'requests' ? 'auto' : '280px' }}
            transition={{ duration: 0.3 }}
          >
            <div className="requests-summary">
              <div className="summary-metrics">
                <div className="metric-card total-requests">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4 0-2.05 1.53-3.76 3.56-3.97l1.07-.11.5-.95C8.08 7.14 9.94 6 12 6c2.62 0 4.88 1.86 5.39 4.43l.3 1.5 1.53.11c1.56.1 2.78 1.41 2.78 2.96 0 1.65-1.35 3-3 3zm-9-3.82l-2.09-2.09L6.5 13.5 10 17l6.01-6.01-1.41-1.41-4.6 4.6z" fill="#4285f4"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{data.requests.total.toLocaleString()}</div>
                    <div className="metric-label">Total Requests</div>
                  </div>
                </div>
                
                <div className="metric-card success-rate">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34a853"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{data.requests.successRate}%</div>
                    <div className="metric-label">Success Rate</div>
                  </div>
                </div>
                
                <div className="metric-card failed-requests">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ea4335"/>
                    </svg>
                  </div>
                  <div className="metric-content">
                    <div className="metric-value">{data.requests.failed.toLocaleString()}</div>
                    <div className="metric-label">Failed Requests</div>
                  </div>
                </div>
              </div>
            </div>
            
            {expandedSection === 'requests' && data.requests.history && data.requests.history.length > 0 && (
              <div className="requests-history">
                <h3>Daily Request Volume</h3>
                <div className="history-chart stacked">
                  {data.requests.history.map((day, index) => {
                    const maxTotal = Math.max(...data.requests.history.map(d => d.success + d.failed));
                    const successHeight = maxTotal > 0 ? (day.success / maxTotal) * 100 : 0;
                    const failedHeight = maxTotal > 0 ? (day.failed / maxTotal) * 100 : 0;
                    
                    return (
                      <div className="chart-column" key={index}>
                        <div className="chart-bar-container">
                          <div className="chart-bar-stacked">
                            <div 
                              className="chart-bar success" 
                              style={{ height: `${successHeight}%` }}
                            >
                              <div className="bar-tooltip">{day.success.toLocaleString()} successful</div>
                            </div>
                            <div 
                              className="chart-bar failed" 
                              style={{ height: `${failedHeight}%` }}
                            >
                              <div className="bar-tooltip">{day.failed} failed</div>
                            </div>
                          </div>
                        </div>
                        <div className="chart-label">{day.date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Model Usage Card */}
        <div className="usage-card model-usage">
          <div className="card-header" onClick={() => toggleSection('models')}>
            <h2>Endpoints Usage</h2>
            <button className={`btn-expand ${expandedSection === 'models' ? 'expanded' : ''}`}>
              <ChevronDownIcon />
            </button>
          </div>
          
          <motion.div 
            className="card-content"
            initial={false}
            animate={{ height: expandedSection === 'models' ? 'auto' : '280px' }}
            transition={{ duration: 0.3 }}
          >
            <div className="models-table-container">
              <table className="models-table">
                <thead>
                  <tr>
                    <th>Endpoint</th>
                    <th>Requests</th>
                    <th>Credits Used</th>
                    <th>Avg. Response Time</th>
                    <th>Success Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.models && data.models.map((model, index) => (
                    <tr key={index}>
                      <td>{model.name}</td>
                      <td>{model.requests.toLocaleString()}</td>
                      <td>{model.credits.toLocaleString()}</td>
                      <td>{model.avgResponseTime}ms</td>
                      <td>
                        <div className="success-rate-indicator">
                          <div className="rate-bar">
                            <div 
                              className="rate-fill" 
                              style={{ width: `${model.successRate}%` }}
                            ></div>
                          </div>
                          <span>{model.successRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {expandedSection === 'models' && data.models && data.models.length > 0 && (
              <div className="models-distribution">
                <h3>Credit Distribution by Model</h3>
                <div className="distribution-chart">
                  <div className="donut-chart">
                    <svg width="180" height="180" viewBox="0 0 180 180">
                      <circle cx="90" cy="90" r="80" fill="#f5f5f5" />
                      
                      {/* Calculate and render pie segments */}
                      {(() => {
                        const total = data.models.reduce((sum, model) => sum + model.credits, 0);
                        let currentAngle = 0;
                        
                        return data.models.map((model, index) => {
                          const percentage = total > 0 ? (model.credits / total) * 100 : 0;
                          const angle = (percentage / 100) * 360;
                          
                          // Calculate the SVG arc path
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          currentAngle = endAngle;
                          
                          const startX = 90 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
                          const startY = 90 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
                          const endX = 90 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
                          const endY = 90 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
                          
                          const largeArcFlag = angle > 180 ? 1 : 0;
                          
                          const colors = ['#4285f4', '#34a853', '#fbbc04'];
                          
                          return (
                            <path 
                              key={index}
                              d={`M 90 90 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                              fill={colors[index % colors.length]}
                            />
                          );
                        });
                      })()}
                      
                      {/* Inner circle for donut effect */}
                      <circle cx="90" cy="90" r="50" fill="white" />
                    </svg>
                    
                    <div className="donut-center">
                      <div className="center-value">{data.credits.used.toLocaleString()}</div>
                      <div className="center-label">Credits Used</div>
                    </div>
                  </div>
                  
                  <div className="distribution-legend">
                    {data.models && data.models.map((model, index) => {
                      const total = data.models.reduce((sum, m) => sum + m.credits, 0);
                      const percentage = total > 0 ? ((model.credits / total) * 100).toFixed(1) : '0.0';
                      const colors = ['#4285f4', '#34a853', '#fbbc04'];
                      
                      return (
                        <div className="legend-item" key={index}>
                          <div 
                            className="legend-color" 
                            style={{ backgroundColor: colors[index % colors.length] }}
                          ></div>
                          <div className="legend-label">{model.name}</div>
                          <div className="legend-value">{model.credits.toLocaleString()} ({percentage}%)</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
        
        {/* Account Limits Card */}
        <div className="usage-card account-limits">
          <div className="card-header" onClick={() => toggleSection('limits')}>
            <h2>Account Limits</h2>
            <button className={`btn-expand ${expandedSection === 'limits' ? 'expanded' : ''}`}>
              <ChevronDownIcon />
            </button>
          </div>
          
          <motion.div 
            className="card-content"
            initial={false}
            animate={{ height: expandedSection === 'limits' ? 'auto' : '280px' }}
            transition={{ duration: 0.3 }}
          >
            <div className="limits-grid">
              <div className="limit-card">
                <div className="limit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="#4285f4"/>
                  </svg>
                </div>
                <div className="limit-content">
                  <div className="limit-value">{data.limits.requestsPerMinute.toLocaleString()}</div>
                  <div className="limit-label">Requests per Minute</div>
                </div>
                <div className="limit-info" title="Maximum number of API requests allowed per minute">
                  <InfoIcon />
                </div>
              </div>
              
              <div className="limit-card">
                <div className="limit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" fill="#4285f4"/>
                  </svg>
                </div>
                <div className="limit-content">
                  <div className="limit-value">{data.limits.requestsPerHour.toLocaleString()}</div>
                  <div className="limit-label">Requests per Hour</div>
                </div>
                <div className="limit-info" title="Maximum number of API requests allowed per hour">
                  <InfoIcon />
                </div>
              </div>
              
              <div className="limit-card">
                <div className="limit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7v-5z" fill="#4285f4"/>
                  </svg>
                </div>
                <div className="limit-content">
                  <div className="limit-value">{data.limits.requestsPerDay.toLocaleString()}</div>
                  <div className="limit-label">Requests per Day</div>
                </div>
                <div className="limit-info" title="Maximum number of API requests allowed per day">
                  <InfoIcon />
                </div>
              </div>
              
              <div className="limit-card">
                <div className="limit-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" fill="#4285f4"/>
                  </svg>
                </div>
                <div className="limit-content">
                  <div className="limit-value">{data.limits.concurrentRequests.toLocaleString()}</div>
                  <div className="limit-label">Concurrent Requests</div>
                </div>
                <div className="limit-info" title="Maximum number of concurrent API requests allowed">
                  <InfoIcon />
                </div>
              </div>
            </div>
            
            {expandedSection === 'limits' && (
              <div className="limits-upgrade">
                <div className="upgrade-message">
                  <h3>Need Higher Limits?</h3>
                  <p>Your current plan allows for the limits shown above. If you need higher limits for your application, consider upgrading to a higher tier plan.</p>
                </div>
                <button className="btn-upgrade">Upgrade Plan</button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Usage;
