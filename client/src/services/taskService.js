import api from './api';

export const taskService = {
  getTasks: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.page) queryParams.append('page', filters.page);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    return await api.get(`/tasks${queryString}`);
  },

  getTaskById: async (id) => {
    return await api.get(`/tasks/${id}`);
  },

  createTask: async (taskData) => {
    return await api.post('/tasks', taskData);
  },

  updateTask: async (id, taskData) => {
    return await api.put(`/tasks/${id}`, taskData);
  },

  deleteTask: async (id) => {
    return await api.delete(`/tasks/${id}`);
  },

  getStats: async () => {
    return await api.get('/tasks/stats');
  }
};

export default taskService;
