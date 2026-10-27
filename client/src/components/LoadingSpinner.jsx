import React from 'react';

export const LoadingSpinner = ({ message = 'Loading workflow tasks...' }) => {
  return (
    <div className="loading-box">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
