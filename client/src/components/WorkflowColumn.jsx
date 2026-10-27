import React from 'react';
import TaskCard from './TaskCard';

export const WorkflowColumn = ({ id, title, color, tasks = [], onEditTask, onAddTaskInStage }) => {
  return (
    <div className="kanban-column" id={`column-${id}`}>
      <div className="column-header">
        <div className="column-title">
          <span style={{ color: color, fontSize: '1.2rem' }}>●</span>
          <span>{title}</span>
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div className="tasks-list">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onEdit={onEditTask} />
        ))}

        {tasks.length === 0 && (
          <div
            style={{
              padding: '24px 12px',
              textAlign: 'center',
              color: '#94a3b8',
              fontSize: '0.85rem',
              border: '2px dashed #e2e8f0',
              borderRadius: '8px'
            }}
          >
            No tasks in {title}
          </div>
        )}
      </div>

      <button
        className="btn btn-outline"
        style={{ marginTop: '14px', width: '100%', fontSize: '0.82rem' }}
        onClick={() => onAddTaskInStage(id)}
      >
        + Add Card
      </button>
    </div>
  );
};

export default WorkflowColumn;
