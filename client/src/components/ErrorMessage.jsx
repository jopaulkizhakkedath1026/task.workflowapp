import React from 'react';

export const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="error-banner">
      <div>
        <strong>Error: </strong> {message}
      </div>
      {onRetry && (
        <button
          className="btn btn-outline"
          style={{ padding: '4px 10px', fontSize: '0.8rem' }}
          onClick={onRetry}
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
