'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { userService } from '../services/api';

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化时检查用户是否已登录
  useEffect(() => {
    const initAuth = async () => {
      try {
        // 检查本地存储中是否有token
        const token = localStorage.getItem('token');
        if (token) {
          // 获取当前用户信息
          const { user } = await userService.getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error('认证初始化失败:', error);
        // 如果token无效，清除它
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // 注册方法
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.error || '注册失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登录方法
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.login(credentials);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.response?.data?.error || '登录失败');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 登出方法
  const logout = () => {
    userService.logout();
    setUser(null);
  };

  // 提供的上下文值
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 自定义钩子，用于访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
