import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import Models from './components/Models';
import './Home.scss';

const Home: React.FC = () => {
  return (
    <div className="home-page">
      <Header />
      <Hero />
      <Features />
      <Models />
      {/* Add other sections as they are created */}
    </div>
  );
};

export default Home;
