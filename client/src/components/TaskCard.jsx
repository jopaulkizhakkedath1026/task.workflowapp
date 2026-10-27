import React from 'react';
import { useTasks } from '../context/TaskContext';

const STAGES = ['todo', 'in_progress', 'review', 'done'];

export const TaskCard = ({ task, onEdit }) => {
  const { moveStatus, removeTask } = useTasks();

  const currentStageIndex = STAGES.indexOf(task.status);
  const canMoveBack = currentStageIndex > 0;
  const canMoveForward = currentStageIndex < STAGES.length - 1;

  const handlePrevStage = (e) => {
    e.stopPropagation();
    if (canMoveBack) {
      moveStatus(task._id, STAGES[currentStageIndex - 1]);
    }
  };

  const handleNextStage = (e) => {
    e.stopPropagation();
    if (canMoveForward) {
      moveStatus(task._id, STAGES[currentStageIndex + 1]);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      removeTask(task._id);
    }
  };

  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const formattedDate = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div className="task-card" onClick={() => onEdit(task)}>
      <div className="task-card-header">
        <h4 className="task-title">{task.title}</h4>
        <span className={`prio-badge prio-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-card-meta">
        {formattedDate ? (
          <span className={`due-date ${isOverdue ? 'overdue' : ''}`}>
            📅 {formattedDate} {isOverdue && '⚠️ Overdue'}
          </span>
        ) : (
          <span className="due-date">No due date</span>
        )}

        <div className="task-actions">
          {canMoveBack && (
            <button
              className="btn-icon"
              title="Move backward in workflow"
              onClick={handlePrevStage}
            >
              ◀
            </button>
          )}

          {canMoveForward && (
            <button
              className="btn-icon"
              title="Advance to next workflow stage"
              onClick={handleNextStage}
            >
              ▶
            </button>
          )}

          <button
            className="btn-icon"
            title="Edit task"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            ✏️
          </button>

          <button
            className="btn-icon delete"
            title="Delete task"
            onClick={handleDelete}
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
