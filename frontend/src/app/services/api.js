import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// 创建axios实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器，添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 用户相关API
export const userService = {
  // 用户注册
  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  // 用户登录
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },
  
  // 获取当前用户信息
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  // 退出登录
  logout: () => {
    localStorage.removeItem('token');
  }
};

// 日记相关API
export const journalService = {
  // 获取今日日记
  getTodayJournal: async () => {
    const response = await api.get('/journals/today');
    return response.data;
  },
  
  // 创建新日记
  createJournal: async (content) => {
    const response = await api.post('/journals', { content });
    return response.data;
  },
  
  // 更新日记
  updateJournal: async (id, content) => {
    const response = await api.put(`/journals/${id}`, { content });
    return response.data;
  },
  
  // 获取所有日记
  getJournals: async () => {
    const response = await api.get('/journals');
    return response.data;
  },
  
  // 获取单个日记
  getJournal: async (id) => {
    const response = await api.get(`/journals/${id}`);
    return response.data;
  },
  
  // 删除日记
  deleteJournal: async (id) => {
    const response = await api.delete(`/journals/${id}`);
    return response.data;
  },
  
  // 更新日记分析结果
  updateJournalAnalysis: async (id, analysisData) => {
    const response = await api.put(`/journals/${id}/analysis`, analysisData);
    return response.data;
  },
  
  // 获取周报
  getWeeklyReport: async () => {
    const response = await api.get('/journals/weekly-report');
    return response.data;
  }
};

// 待办事项相关API
export const taskService = {
  // 创建新待办事项
  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },
  
  // 获取所有待办事项
  getTasks: async (completed) => {
    const url = completed !== undefined ? `/tasks?completed=${completed}` : '/tasks';
    const response = await api.get(url);
    return response.data;
  },
  
  // 获取单个待办事项
  getTask: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },
  
  // 更新待办事项
  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },
  
  // 删除待办事项
  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },
  
  // 更新提醒状态
  updateReminderStatus: async (id) => {
    const response = await api.put(`/tasks/${id}/reminder`);
    return response.data;
  }
};

// 设置相关API
export const settingsService = {
  // 获取用户设置
  getSettings: async () => {
    const response = await api.get('/settings');
    return response.data;
  },
  
  // 更新用户设置
  updateSettings: async (settingsData) => {
    const response = await api.put('/settings', settingsData);
    return response.data;
  },
  
  // 更新API密钥
  updateApiKey: async (apiKey) => {
    const response = await api.put('/settings/api-key', { apiKey });
    return response.data;
  },
  
  // 获取API密钥
  getApiKey: async () => {
    const response = await api.get('/settings/api-key');
    return response.data;
  },
  
  // 删除API密钥
  deleteApiKey: async () => {
    const response = await api.delete('/settings/api-key');
    return response.data;
  }
};

// DeepSeek API服务
export const deepseekService = {
  // 分析日记内容
  analyzeJournal: async (content) => {
    try {
      // 这里应该是前端调用后端的API，后端再调用DeepSeek API
      const response = await api.post('/analyze', { content });
      return response.data;
    } catch (error) {
      console.error('分析日记内容失败:', error);
      throw error;
    }
  },
  
  // 提取待办事项
  extractTasks: async (content) => {
    try {
      const response = await api.post('/extract-tasks', { content });
      return response.data;
    } catch (error) {
      console.error('提取待办事项失败:', error);
      throw error;
    }
  }
};

export default api;
