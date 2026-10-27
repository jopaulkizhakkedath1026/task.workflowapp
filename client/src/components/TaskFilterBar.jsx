import React from 'react';
import { useTasks } from '../context/TaskContext';

export const TaskFilterBar = () => {
  const { filters, setFilters } = useTasks();

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  };

  const handlePriorityChange = (e) => {
    setFilters((prev) => ({ ...prev, priority: e.target.value }));
  };

  const handleStatusChange = (e) => {
    setFilters((prev) => ({ ...prev, status: e.target.value }));
  };

  const handleReset = () => {
    setFilters({ search: '', priority: '', status: '' });
  };

  const isFiltered = filters.search || filters.priority || filters.status;

  return (
    <div className="filter-toolbar">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search tasks by title or details..."
          value={filters.search}
          onChange={handleSearchChange}
        />
      </div>

      <div className="filter-selects">
        <select
          className="select-ctrl"
          value={filters.priority}
          onChange={handlePriorityChange}
        >
          <option value="">All Priorities</option>
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </select>

        <select
          className="select-ctrl"
          value={filters.status}
          onChange={handleStatusChange}
        >
          <option value="">All Pipeline Stages</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="done">Completed</option>
        </select>

        {isFiltered && (
          <button className="btn btn-outline" onClick={handleReset}>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskFilterBar;
