'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  
  const fetchTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.get('/api/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('获取待办事项失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [isAuthenticated, fetchTasks]);
  
  const createTask = async (content, journalId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/api/tasks', { content, journalId });
      setTasks(prevTasks => [...prevTasks, response.data]);
      return response.data;
    } catch (err) {
      setError('创建待办事项失败');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const updateTask = async (taskId, updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.put(`/api/tasks/${taskId}`, updates);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, ...response.data } : task
        )
      );
      return response.data;
    } catch (err) {
      setError('更新待办事项失败');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteTask = async (taskId) => {
    setLoading(true);
    setError(null);
    
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    } catch (err) {
      setError('删除待办事项失败');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  const extractTasksFromJournal = async (journalId, journalContent) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post(`/api/journals/${journalId}/extract-tasks`, {
        content: journalContent
      });
      
      if (response.data.tasks && response.data.tasks.length > 0) {
        setTasks(prevTasks => [...prevTasks, ...response.data.tasks]);
      }
      
      return response.data.tasks || [];
    } catch (err) {
      setError('从日记中提取待办事项失败');
      console.error(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        extractTasksFromJournal
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTask() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
}
