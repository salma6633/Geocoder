import React, { useState } from 'react';
import Lottie from 'lottie-react';
import mapAnimation from '../../../../assets/lottie/map-animation.json';
import './Hero.scss';

const Hero: React.FC = () => {
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [estimationResult, setEstimationResult] = useState<null | { distance: string; time: string }>(null);

  const handleEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCalculating(true);
    
    // Simulate API call
    setTimeout(() => {
      setEstimationResult({
        distance: '15.3 km',
        time: '28 minutes'
      });
      setIsCalculating(false);
    }, 1500);
  };

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Reliable Delivery Estimation</h1>
            <p>Based on extensive real-world data, our system provides highly accurate point-to-point delivery time and distance estimations for developers.</p>
            
            <div className="estimation-form-container">
              <form className="estimation-form" onSubmit={handleEstimate}>
                <div className="form-group">
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2C6.68 2 4 4.68 4 8C4 12.5 10 18 10 18C10 18 16 12.5 16 8C16 4.68 13.32 2 10 2ZM10 10C8.9 10 8 9.1 8 8C8 6.9 8.9 6 10 6C11.1 6 12 6.9 12 8C12 9.1 11.1 10 10 10Z" fill="#5f6368"/>
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      placeholder="From location" 
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 2C6.68 2 4 4.68 4 8C4 12.5 10 18 10 18C10 18 16 12.5 16 8C16 4.68 13.32 2 10 2ZM10 10C8.9 10 8 9.1 8 8C8 6.9 8.9 6 10 6C11.1 6 12 6.9 12 8C12 9.1 11.1 10 10 10Z" fill="#5f6368"/>
                      </svg>
                    </span>
                    <input 
                      type="text" 
                      placeholder="To location" 
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary btn-block"
                  disabled={isCalculating}
                >
                  {isCalculating ? 'Calculating...' : 'Estimate Delivery'}
                </button>
              </form>

              {estimationResult && (
                <div className="estimation-result">
                  <div className="result-item">
                    <span className="result-label">Distance:</span>
                    <span className="result-value">{estimationResult.distance}</span>
                  </div>
                  <div className="result-item">
                    <span className="result-label">Estimated Time:</span>
                    <span className="result-value">{estimationResult.time}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="hero-image">
            <div className="map-illustration">
              <Lottie animationData={mapAnimation} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
