import React from 'react';

export const EmptyState = ({
  title = 'No Tasks Found',
  message = 'There are no tasks matching your current filter. Create a new task to get started!',
  onAction,
  actionText = '+ Add Task'
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">📋</div>
      <h4>{title}</h4>
      <p>{message}</p>
      {onAction && (
        <button
          className="btn btn-primary"
          style={{ marginTop: '14px' }}
          onClick={onAction}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
