import React from 'react';

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner">
      <div className="spinner-ring large"></div>
    </div>
    <p className="loading-text">Loading...</p>
  </div>
);

export default LoadingScreen;
