'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { taskService, deepseekService } from '../services/api';

// 创建待办事项上下文
const TaskContext = createContext();

// 待办事项提供者组件
export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取所有待办事项
  const fetchTasks = async (completed) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.getTasks(completed);
      setTasks(response.tasks);
      return response.tasks;
    } catch (error) {
      setError(error.response?.data?.error || '获取待办事项失败');
      console.error('获取待办事项失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 创建新待办事项
  const createTask = async (taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.createTask(taskData);
      setTasks([response.task, ...tasks]);
      return response.task;
    } catch (error) {
      setError(error.response?.data?.error || '创建待办事项失败');
      console.error('创建待办事项失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 更新待办事项
  const updateTask = async (id, taskData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await taskService.updateTask(id, taskData);
      setTasks(tasks.map(task => 
        task._id === id ? response.task : task
      ));
      return response.task;
    } catch (error) {
      setError(error.response?.data?.error || '更新待办事项失败');
      console.error('更新待办事项失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 删除待办事项
  const deleteTask = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await taskService.deleteTask(id);
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      setError(error.response?.data?.error || '删除待办事项失败');
      console.error('删除待办事项失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 更新提醒状态
  const updateReminderStatus = async (id) => {
    setError(null);
    try {
      const response = await taskService.updateReminderStatus(id);
      setTasks(tasks.map(task => 
        task._id === id ? response.task : task
      ));
      return response.task;
    } catch (error) {
      setError(error.response?.data?.error || '更新提醒状态失败');
      console.error('更新提醒状态失败:', error);
      throw error;
    }
  };

  // 从日记内容提取待办事项
  const extractTasksFromJournal = async (journalId, content) => {
    setLoading(true);
    setError(null);
    try {
      // 调用DeepSeek API提取待办事项
      const extractedTasks = await deepseekService.extractTasks(content);
      
      // 创建提取的待办事项
      const createdTasks = [];
      for (const taskContent of extractedTasks) {
        const taskData = {
          content: taskContent,
          journalId,
          originalText: taskContent
        };
        const response = await taskService.createTask(taskData);
        createdTasks.push(response.task);
      }
      
      // 更新任务列表
      setTasks([...createdTasks, ...tasks]);
      
      return createdTasks;
    } catch (error) {
      setError(error.response?.data?.error || '提取待办事项失败');
      console.error('提取待办事项失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 提供的上下文值
  const value = {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    updateReminderStatus,
    extractTasksFromJournal
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// 自定义钩子，用于访问待办事项上下文
export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
