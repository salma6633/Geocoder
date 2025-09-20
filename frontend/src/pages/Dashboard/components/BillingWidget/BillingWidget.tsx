import React from 'react';
import './BillingWidget.scss';

const BillingWidget: React.FC = () => {
  return (
    <div className="dashboard-widget billing-widget">
      <div className="widget-header">
        <h3>Billing Overview</h3>
        <div className="widget-actions">
          <button className="btn btn-text btn-sm">View Details</button>
        </div>
      </div>
      <div className="widget-content">
        <div className="billing-summary">
          <div className="billing-period">
            <div className="period-label">Current Billing Period</div>
            <div className="period-value">Apr 1 - Apr 30, 2025</div>
          </div>
          <div className="billing-cost">
            <div className="cost-label">Estimated Cost</div>
            <div className="cost-value">$245.78</div>
            <div className="cost-comparison">+$32.45 from last month</div>
          </div>
        </div>
        
        <div className="billing-usage">
          <div className="usage-header">
            <div className="usage-title">Usage Breakdown</div>
          </div>
          <div className="usage-items">
            <div className="usage-item">
              <div className="usage-item-info">
                <div className="usage-item-name">Time Estimation API</div>
                <div className="usage-item-count">845,320 requests</div>
              </div>
              <div className="usage-item-cost">$169.06</div>
            </div>
            <div className="usage-item">
              <div className="usage-item-info">
                <div className="usage-item-name">Distance Estimation API</div>
                <div className="usage-item-count">382,150 requests</div>
              </div>
              <div className="usage-item-cost">$76.43</div>
            </div>
            <div className="usage-item">
              <div className="usage-item-info">
                <div className="usage-item-name">Combined Model API</div>
                <div className="usage-item-count">1,450 requests</div>
              </div>
              <div className="usage-item-cost">$0.29</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingWidget;
