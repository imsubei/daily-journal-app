'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { settingsService } from '../services/api';

// 创建设置上下文
const SettingsContext = createContext();

// 设置提供者组件
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    reminderInterval: 20,
    theme: 'system',
    emailNotifications: false,
    hasApiKey: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 获取用户设置
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getSettings();
      setSettings(response.settings);
      return response.settings;
    } catch (error) {
      setError(error.response?.data?.error || '获取设置失败');
      console.error('获取设置失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 更新用户设置
  const updateSettings = async (settingsData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.updateSettings(settingsData);
      setSettings(response.settings);
      return response.settings;
    } catch (error) {
      setError(error.response?.data?.error || '更新设置失败');
      console.error('更新设置失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 更新API密钥
  const updateApiKey = async (apiKey) => {
    setLoading(true);
    setError(null);
    try {
      await settingsService.updateApiKey(apiKey);
      setSettings({ ...settings, hasApiKey: true });
    } catch (error) {
      setError(error.response?.data?.error || '更新API密钥失败');
      console.error('更新API密钥失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 获取API密钥
  const getApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await settingsService.getApiKey();
      return response.apiKey;
    } catch (error) {
      if (error.response?.status === 404) {
        // API密钥未设置，这不是错误
        return null;
      }
      setError(error.response?.data?.error || '获取API密钥失败');
      console.error('获取API密钥失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 删除API密钥
  const deleteApiKey = async () => {
    setLoading(true);
    setError(null);
    try {
      await settingsService.deleteApiKey();
      setSettings({ ...settings, hasApiKey: false });
    } catch (error) {
      setError(error.response?.data?.error || '删除API密钥失败');
      console.error('删除API密钥失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 提供的上下文值
  const value = {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    updateApiKey,
    getApiKey,
    deleteApiKey
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

// 自定义钩子，用于访问设置上下文
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
