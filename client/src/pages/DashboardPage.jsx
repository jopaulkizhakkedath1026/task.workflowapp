import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import WorkflowColumn from '../components/WorkflowColumn';
import TaskFilterBar from '../components/TaskFilterBar';
import TaskFormModal from '../components/TaskFormModal';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ErrorMessage from '../components/ErrorMessage';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'var(--col-todo)' },
  { id: 'in_progress', title: 'In Progress', color: 'var(--col-progress)' },
  { id: 'review', title: 'Review', color: 'var(--col-review)' },
  { id: 'done', title: 'Completed', color: 'var(--col-done)' }
];

export const DashboardPage = ({ isModalOpen, setIsModalOpen }) => {
  const { tasks, stats, loading, error, refreshTasks } = useTasks();
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [defaultStage, setDefaultStage] = useState('todo');

  const handleOpenCreateModal = (stage = 'todo') => {
    setTaskToEdit(null);
    setDefaultStage(stage);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  // Group tasks by status
  const tasksByStage = {
    todo: tasks.filter((t) => t.status === 'todo'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    review: tasks.filter((t) => t.status === 'review'),
    done: tasks.filter((t) => t.status === 'done')
  };

  return (
    <div className="main-content">
      {/* Workflow Stats Ribbon */}
      <div className="stats-ribbon">
        <div className="stat-card">
          <div className="stat-info">
            <h4>Total Tasks</h4>
            <div className="stat-num">{stats.total || tasks.length}</div>
          </div>
          <div className="stat-dot" style={{ background: 'var(--primary)' }}></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h4>To Do</h4>
            <div className="stat-num">{stats.todo || 0}</div>
          </div>
          <div className="stat-dot" style={{ background: 'var(--col-todo)' }}></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h4>In Progress</h4>
            <div className="stat-num">{stats.in_progress || 0}</div>
          </div>
          <div className="stat-dot" style={{ background: 'var(--col-progress)' }}></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h4>Review</h4>
            <div className="stat-num">{stats.review || 0}</div>
          </div>
          <div className="stat-dot" style={{ background: 'var(--col-review)' }}></div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h4>Completed</h4>
            <div className="stat-num">{stats.done || 0}</div>
          </div>
          <div className="stat-dot" style={{ background: 'var(--col-done)' }}></div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <TaskFilterBar />

      {/* Error State Banner */}
      {error && <ErrorMessage message={error} onRetry={refreshTasks} />}

      {/* Loading State */}
      {loading && tasks.length === 0 ? (
        <LoadingSpinner message="Fetching workflow tasks from server..." />
      ) : tasks.length === 0 && !error ? (
        /* Empty State */
        <EmptyState
          title="Workflow Board is Empty"
          message="No tasks currently found in your workspace. Start by adding your first task!"
          onAction={() => handleOpenCreateModal('todo')}
          actionText="+ Add Your First Task"
        />
      ) : (
        /* Success State: Interactive Kanban Board */
        <div className="kanban-board">
          {COLUMNS.map((col) => (
            <WorkflowColumn
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              tasks={tasksByStage[col.id] || []}
              onEditTask={handleOpenEditModal}
              onAddTaskInStage={handleOpenCreateModal}
            />
          ))}
        </div>
      )}

      {/* Task Creation & Editing Modal */}
      <TaskFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
        defaultStatus={defaultStage}
      />
    </div>
  );
};

export default DashboardPage;
