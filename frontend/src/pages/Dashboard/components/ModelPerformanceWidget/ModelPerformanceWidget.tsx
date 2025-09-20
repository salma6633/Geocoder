import React from 'react';
import './ModelPerformanceWidget.scss';

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

const ModelPerformanceWidget: React.FC = () => {
  return (
    <div className="dashboard-widget model-performance-widget">
      <div className="widget-header">
        <h3>Model Performance</h3>
        <div className="widget-actions">
          <button className="icon-button">
            <RefreshIcon />
          </button>
          <button className="icon-button">
            <MoreIcon />
          </button>
        </div>
      </div>
      <div className="widget-content">
        <div className="model-metrics">
          <div className="model-metric">
            <div className="metric-header">
              <div className="metric-name">Time Estimation</div>
              <div className="metric-badge success">Active</div>
            </div>
            <div className="metric-chart">
              <div className="progress-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="#e0e0e0" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke="#1a73e8" strokeWidth="6" fill="none" strokeDasharray="213.52" strokeDashoffset="21.352" />
                  <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1a73e8">90%</text>
                </svg>
              </div>
            </div>
            <div className="metric-details">
              <div className="detail-item">
                <div className="detail-label">Accuracy</div>
                <div className="detail-value">98.7%</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Avg. Error</div>
                <div className="detail-value">±2 min</div>
              </div>
            </div>
          </div>
          
          <div className="model-metric">
            <div className="metric-header">
              <div className="metric-name">Distance Estimation</div>
              <div className="metric-badge success">Active</div>
            </div>
            <div className="metric-chart">
              <div className="progress-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="#e0e0e0" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke="#34a853" strokeWidth="6" fill="none" strokeDasharray="213.52" strokeDashoffset="32.028" />
                  <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#34a853">85%</text>
                </svg>
              </div>
            </div>
            <div className="metric-details">
              <div className="detail-item">
                <div className="detail-label">Accuracy</div>
                <div className="detail-value">99.2%</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Avg. Error</div>
                <div className="detail-value">±0.3 km</div>
              </div>
            </div>
          </div>
          
          <div className="model-metric">
            <div className="metric-header">
              <div className="metric-name">Combined Model</div>
              <div className="metric-badge warning">Training</div>
            </div>
            <div className="metric-chart">
              <div className="progress-ring">
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="#e0e0e0" strokeWidth="6" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke="#fbbc04" strokeWidth="6" fill="none" strokeDasharray="213.52" strokeDashoffset="74.732" />
                  <text x="40" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#fbbc04">65%</text>
                </svg>
              </div>
            </div>
            <div className="metric-details">
              <div className="detail-item">
                <div className="detail-label">Training</div>
                <div className="detail-value">In Progress</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">ETA</div>
                <div className="detail-value">2 days</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelPerformanceWidget;
