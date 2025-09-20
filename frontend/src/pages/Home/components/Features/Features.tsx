import React from 'react';
import './Features.scss';

const Features: React.FC = () => {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Our advanced platform offers cutting-edge solutions for delivery estimation</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C16.27 4 10 10.27 10 18C10 28.5 24 44 24 44C24 44 38 28.5 38 18C38 10.27 31.73 4 24 4ZM24 23C21.24 23 19 20.76 19 18C19 15.24 21.24 13 24 13C26.76 13 29 15.24 29 18C29 20.76 26.76 23 24 23Z" fill="#1a73e8"/>
              </svg>
            </div>
            <h3>Precise Location Mapping</h3>
            <p>Our system accurately maps locations for precise point-to-point estimations.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM24 8C26.2 8 28 9.8 28 12C28 14.2 26.2 16 24 16C21.8 16 20 14.2 20 12C20 9.8 21.8 8 24 8ZM32 36H16V32H20V20H16V16H24V32H28V36H32Z" fill="#1a73e8"/>
              </svg>
            </div>
            <h3>Real-Time Information</h3>
            <p>Get up-to-date information about traffic, weather, and other factors affecting delivery times.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM32.38 32.38L20 26V14H24V23.16L34 28.18L32.38 32.38Z" fill="#1a73e8"/>
              </svg>
            </div>
            <h3>Time-Saving Predictions</h3>
            <p>Our system calculates delivery times with exceptional accuracy, saving you time and resources.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 4C12.95 4 4 12.95 4 24C4 35.05 12.95 44 24 44C35.05 44 44 35.05 44 24C44 12.95 35.05 4 24 4ZM24 40C15.18 40 8 32.82 8 24C8 15.18 15.18 8 24 8C32.82 8 40 15.18 40 24C40 32.82 32.82 40 24 40ZM33.6 14.4L36 12C32.33 8.33 28.33 6 24 6V10C27.17 10 30.17 11.67 33.6 14.4ZM24 14V18C25.65 18 27.2 18.55 28.64 19.64C30.08 20.73 31.18 22.27 32 24H36C35.05 21.33 33.5 19.17 31.36 17.44C29.22 15.71 26.73 14.67 24 14Z" fill="#1a73e8"/>
              </svg>
            </div>
            <h3>Advanced Analytics</h3>
            <p>Gain insights into delivery patterns and optimize your logistics operations.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
