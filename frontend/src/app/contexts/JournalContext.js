'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { journalService, deepseekService } from '../services/api';

// 创建日记上下文
const JournalContext = createContext();

// 日记提供者组件
export const JournalProvider = ({ children }) => {
  const [currentJournal, setCurrentJournal] = useState(null);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // 获取今日日记
  const fetchTodayJournal = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await journalService.getTodayJournal();
      setCurrentJournal(response.journal);
      return response.journal;
    } catch (error) {
      if (error.response?.status === 404) {
        // 今日尚未创建日记，这不是错误
        setCurrentJournal(null);
      } else {
        setError(error.response?.data?.error || '获取今日日记失败');
        console.error('获取今日日记失败:', error);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 创建或更新今日日记
  const saveJournal = async (content) => {
    setLoading(true);
    setError(null);
    try {
      let response;
      if (currentJournal) {
        // 更新现有日记
        response = await journalService.updateJournal(currentJournal._id, content);
      } else {
        // 创建新日记
        response = await journalService.createJournal(content);
      }
      setCurrentJournal(response.journal);
      return response.journal;
    } catch (error) {
      setError(error.response?.data?.error || '保存日记失败');
      console.error('保存日记失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 获取所有日记
  const fetchAllJournals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await journalService.getJournals();
      setJournals(response.journals);
      return response.journals;
    } catch (error) {
      setError(error.response?.data?.error || '获取日记列表失败');
      console.error('获取日记列表失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 获取单个日记
  const fetchJournal = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await journalService.getJournal(id);
      return response.journal;
    } catch (error) {
      setError(error.response?.data?.error || '获取日记详情失败');
      console.error('获取日记详情失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 删除日记
  const deleteJournal = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await journalService.deleteJournal(id);
      // 如果删除的是当前日记，清空当前日记
      if (currentJournal && currentJournal._id === id) {
        setCurrentJournal(null);
      }
      // 更新日记列表
      setJournals(journals.filter(journal => journal._id !== id));
    } catch (error) {
      setError(error.response?.data?.error || '删除日记失败');
      console.error('删除日记失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 分析日记内容
  const analyzeJournal = async (journalId, content) => {
    setAnalyzing(true);
    setError(null);
    try {
      // 调用DeepSeek API分析内容
      const analysisResult = await deepseekService.analyzeJournal(content);
      
      // 更新日记的分析结果
      const response = await journalService.updateJournalAnalysis(journalId, analysisResult);
      
      // 更新当前日记
      if (currentJournal && currentJournal._id === journalId) {
        setCurrentJournal(response.journal);
      }
      
      return response.journal;
    } catch (error) {
      setError(error.response?.data?.error || '分析日记失败');
      console.error('分析日记失败:', error);
      throw error;
    } finally {
      setAnalyzing(false);
    }
  };

  // 获取周报
  const fetchWeeklyReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await journalService.getWeeklyReport();
      return response.report;
    } catch (error) {
      setError(error.response?.data?.error || '获取周报失败');
      console.error('获取周报失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // 提供的上下文值
  const value = {
    currentJournal,
    journals,
    loading,
    error,
    analyzing,
    fetchTodayJournal,
    saveJournal,
    fetchAllJournals,
    fetchJournal,
    deleteJournal,
    analyzeJournal,
    fetchWeeklyReport
  };

  return <JournalContext.Provider value={value}>{children}</JournalContext.Provider>;
};

// 自定义钩子，用于访问日记上下文
export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};
