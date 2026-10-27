import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { taskService } from '../services/taskService';
import { useAuth } from './AuthContext';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ todo: 0, in_progress: 0, review: 0, done: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', priority: '', status: '' });

  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, statsRes] = await Promise.all([
        taskService.getTasks(filters),
        taskService.getStats().catch(() => ({ stats: null }))
      ]);

      setTasks(tasksRes.tasks || []);
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      setError(err.message || 'Failed to load workflow tasks');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = async (taskData) => {
    setError(null);
    try {
      const res = await taskService.createTask(taskData);
      setTasks((prev) => [res.task, ...prev]);
      // Update quick stats
      setStats((prev) => ({
        ...prev,
        [res.task.status]: (prev[res.task.status] || 0) + 1,
        total: prev.total + 1
      }));
      return res.task;
    } catch (err) {
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    setError(null);
    try {
      const res = await taskService.updateTask(id, taskData);
      setTasks((prev) => prev.map((t) => (t._id === id ? res.task : t)));
      // Refresh stats
      taskService.getStats().then((s) => s?.stats && setStats(s.stats)).catch(() => {});
      return res.task;
    } catch (err) {
      throw err;
    }
  };

  const moveStatus = async (id, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );

    try {
      await taskService.updateTask(id, { status: newStatus });
      taskService.getStats().then((s) => s?.stats && setStats(s.stats)).catch(() => {});
    } catch (err) {
      // Rollback on failure
      loadTasks();
      throw err;
    }
  };

  const removeTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      taskService.getStats().then((s) => s?.stats && setStats(s.stats)).catch(() => {});
    } catch (err) {
      throw err;
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        loading,
        error,
        filters,
        setFilters,
        refreshTasks: loadTasks,
        addTask,
        updateTask,
        moveStatus,
        removeTask
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
