import React from 'react';
import { Link } from 'react-router-dom';
import './Header.scss';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Modern direction/navigation icon with blue colors */}
                <circle cx="16" cy="16" r="14" stroke="#1a73e8" strokeWidth="2" fill="none"/>
                <circle cx="16" cy="16" r="2" fill="#1a73e8"/>
                {/* Direction arrow pointing north */}
                <path d="M16 4L19 14H13L16 4Z" fill="#1a73e8"/>
                {/* Navigation lines */}
                <path d="M16 16L24 8" stroke="#4285f4" strokeWidth="2" strokeLinecap="round"/>
                <path d="M16 16L8 24" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round"/>
                {/* Route path */}
                <path d="M8 12C8 12 12 8 16 8C20 8 24 12 24 12" stroke="#4285f4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2"/>
              </svg>
            </span>
            <span className="logo-text">Armada Etijahat</span>
          </div>
          <nav className="main-nav">
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#estimations">Estimations</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
            </ul>
          </nav>
          <div className="header-actions">
            <Link to="/login">
              <button className="btn btn-secondary">Log In</button>
            </Link>
            <Link to="/signup">
              <button className="btn btn-primary">Sign Up</button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
