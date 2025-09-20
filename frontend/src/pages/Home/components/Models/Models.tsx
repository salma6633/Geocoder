import React, { useState } from 'react';
import './Models.scss';

const Models: React.FC = () => {
  const [activeTab, setActiveTab] = useState('time');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <section id="estimations" className="models-section">
      <div className="container">
        <div className="section-header">
          <h2>Our Estimation Services</h2>
          <p>Based on extensive real-world data, our specialized algorithms deliver unparalleled accuracy</p>
        </div>
        
        <div className="models-showcase">
          <div className="models-tabs">
            <div className="tabs-container">
              <button 
                className={`tab-button ${activeTab === 'time' ? 'active' : ''}`} 
                onClick={() => handleTabChange('time')}
              >
                <div className="tab-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12C2 17.52 6.47 22 11.99 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 11.99 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20ZM12.5 7H11V13L16.25 16.15L17 14.92L12.5 12.25V7Z" fill="#1a73e8"/>
                  </svg>
                </div>
                <span>Time Estimation</span>
              </button>
              <button 
                className={`tab-button ${activeTab === 'distance' ? 'active' : ''}`} 
                onClick={() => handleTabChange('distance')}
              >
                <div className="tab-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" fill="#1a73e8"/>
                  </svg>
                </div>
                <span>Distance Estimation</span>
              </button>
              <button 
                className={`tab-button ${activeTab === 'combined' ? 'active' : ''}`} 
                onClick={() => handleTabChange('combined')}
              >
                <div className="tab-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 11V5L12 2L9 5V7H3V21H21V11H15ZM7 19H5V17H7V19ZM7 15H5V13H7V15ZM7 11H5V9H7V11ZM13 19H11V17H13V19ZM13 15H11V13H13V15ZM13 11H11V9H13V11ZM13 7H11V5H13V7ZM19 19H17V17H19V19ZM19 15H17V13H19V15Z" fill="#1a73e8"/>
                  </svg>
                </div>
                <span>Time + Distance</span>
              </button>
            </div>
          </div>
          
          <div className="model-content-container">
            <div className={`model-content ${activeTab === 'time' ? 'active' : ''}`} id="time-content">
              <div className="model-info">
              <h3>Time Estimation Service</h3>
              <p className="model-description">Our Time Estimation Service calculates delivery times with exceptional accuracy by analyzing historical patterns, real-time traffic data, and weather conditions.</p>
                
                <div className="model-metrics">
                  <div className="metric">
                    <div className="metric-value">98.7%</div>
                    <div className="metric-label">Accuracy</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">1.2M+</div>
                    <div className="metric-label">Data Points</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">±2 min</div>
                    <div className="metric-label">Average Error</div>
                  </div>
                </div>
                
                <div className="model-features">
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Real-time traffic integration</span>
                  </div>
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Weather condition analysis</span>
                  </div>
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Time-of-day optimization</span>
                  </div>
                </div>
              </div>
              
              <div className="model-visualization">
                <div className="time-model-visual">
                  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="150" cy="150" r="120" stroke="#E8F0FE" strokeWidth="30" />
                    <circle cx="150" cy="150" r="120" stroke="#1a73e8" strokeWidth="30" strokeDasharray="754" strokeDashoffset="188" />
                    <circle cx="150" cy="150" r="100" fill="#f8f9fa" />
                    <line x1="150" y1="150" x2="150" y2="80" stroke="#202124" strokeWidth="4" strokeLinecap="round" />
                    <line x1="150" y1="150" x2="200" y2="150" stroke="#202124" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="150" cy="150" r="10" fill="#1a73e8" />
                    <text x="140" y="60" fontFamily="Arial" fontSize="16" fill="#202124">12</text>
                    <text x="240" y="155" fontFamily="Arial" fontSize="16" fill="#202124">3</text>
                    <text x="145" y="250" fontFamily="Arial" fontSize="16" fill="#202124">6</text>
                    <text x="50" y="155" fontFamily="Arial" fontSize="16" fill="#202124">9</text>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`model-content ${activeTab === 'distance' ? 'active' : ''}`} id="distance-content">
              <div className="model-info">
              <h3>Distance Estimation Service</h3>
              <p className="model-description">Our Distance Estimation Service calculates the optimal route between any two points, considering road networks, traffic patterns, and geographical constraints.</p>
                
                <div className="model-metrics">
                  <div className="metric">
                    <div className="metric-value">99.2%</div>
                    <div className="metric-label">Accuracy</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">1.5M+</div>
                    <div className="metric-label">Data Points</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">±0.3 km</div>
                    <div className="metric-label">Average Error</div>
                  </div>
                </div>
                
                <div className="model-features">
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Advanced route optimization</span>
                  </div>
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Real-time road closure updates</span>
                  </div>
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Terrain-aware calculations</span>
                  </div>
                </div>
              </div>
              
              <div className="model-visualization">
                <div className="distance-model-visual">
                  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="300" height="300" rx="8" fill="#E8F0FE" />
                    <circle cx="80" cy="80" r="15" fill="#1a73e8" />
                    <circle cx="220" cy="220" r="15" fill="#1a73e8" />
                    <path d="M80 80C80 80 120 120 150 150C180 180 220 220 220 220" stroke="#1a73e8" strokeWidth="4" strokeLinecap="round" />
                    <path d="M80 80C80 80 100 150 150 150C200 150 220 220 220 220" stroke="#4285f4" strokeWidth="4" strokeLinecap="round" strokeDasharray="5 5" />
                    <path d="M80 80L220 220" stroke="#0d47a1" strokeWidth="2" strokeLinecap="round" strokeDasharray="2 2" />
                    <text x="70" y="60" fontFamily="Arial" fontSize="12" fill="#202124">Start</text>
                    <text x="210" y="250" fontFamily="Arial" fontSize="12" fill="#202124">End</text>
                  </svg>
                </div>
              </div>
            </div>
            
            <div className={`model-content ${activeTab === 'combined' ? 'active' : ''}`} id="combined-content">
              <div className="model-info">
              <h3>Time + Distance Estimation Service</h3>
              <p className="model-description">Our combined service provides comprehensive delivery estimations by integrating both time and distance calculations for the most accurate end-to-end planning.</p>
                
                <div className="model-metrics">
                  <div className="metric">
                    <div className="metric-value">99.5%</div>
                    <div className="metric-label">Accuracy</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">4M+</div>
                    <div className="metric-label">Data Points</div>
                  </div>
                  <div className="metric">
                    <div className="metric-value">Highly Reliable</div>
                    <div className="metric-label">Technology</div>
                  </div>
                </div>
                
                <div className="model-features">
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Comprehensive delivery planning</span>
                  </div>
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Multi-factor optimization</span>
                  </div>
                  <div className="model-feature">
                    <div className="feature-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 0C4.48 0 0 4.48 0 10C0 15.52 4.48 20 10 20C15.52 20 20 15.52 20 10C20 4.48 15.52 0 10 0ZM14.03 8.2L9.36 12.86C9.22 13.01 9.03 13.08 8.83 13.08C8.64 13.08 8.45 13.01 8.3 12.86L5.97 10.53C5.68 10.24 5.68 9.76 5.97 9.47C6.26 9.18 6.74 9.18 7.03 9.47L8.83 11.27L12.97 7.14C13.26 6.84 13.74 6.84 14.03 7.14C14.32 7.43 14.32 7.9 14.03 8.2Z" fill="#34a853"/>
                      </svg>
                    </div>
                    <span>Advanced computational algorithms</span>
                  </div>
                </div>
              </div>
              
              <div className="model-visualization">
                <div className="combined-model-visual">
                  <svg width="300" height="300" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="300" height="300" rx="8" fill="#E8F0FE" />
                    <circle cx="80" cy="80" r="15" fill="#1a73e8" />
                    <circle cx="220" cy="220" r="15" fill="#1a73e8" />
                    <path d="M80 80C80 80 120 120 150 150C180 180 220 220 220 220" stroke="#1a73e8" strokeWidth="4" strokeLinecap="round" />
                    <path d="M80 80C80 80 100 150 150 150C200 150 220 220 220 220" stroke="#4285f4" strokeWidth="4" strokeLinecap="round" strokeDasharray="5 5" />
                    
                    {/* Clock overlay */}
                    <circle cx="150" cy="150" r="50" fill="rgba(255, 255, 255, 0.7)" />
                    <circle cx="150" cy="150" r="48" stroke="#1a73e8" strokeWidth="2" />
                    <line x1="150" y1="150" x2="150" y2="120" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" />
                    <line x1="150" y1="150" x2="170" y2="150" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" />
                    
                    {/* Data points and connections */}
                    <circle cx="100" cy="100" r="3" fill="#34a853" />
                    <circle cx="120" cy="130" r="3" fill="#34a853" />
                    <circle cx="140" cy="110" r="3" fill="#34a853" />
                    <circle cx="160" cy="140" r="3" fill="#34a853" />
                    <circle cx="180" cy="120" r="3" fill="#34a853" />
                    <circle cx="200" cy="150" r="3" fill="#34a853" />
                    
                    <path d="M100 100L120 130L140 110L160 140L180 120L200 150" stroke="#34a853" strokeWidth="1" strokeDasharray="2 2" />
                    
                    {/* AI visualization elements */}
                    <path d="M50 250C50 250 100 230 150 250C200 270 250 250 250 250" stroke="#fbbc04" strokeWidth="2" strokeDasharray="3 3" />
                    <path d="M50 230C50 230 100 250 150 230C200 210 250 230 250 230" stroke="#ea4335" strokeWidth="2" strokeDasharray="3 3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="models-cta">
          <button className="btn btn-primary">Try Our Services</button>
          <button className="btn btn-outline">Learn More</button>
        </div>
      </div>
    </section>
  );
};

export default Models;
