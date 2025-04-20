'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AppLayout from './components/AppLayout';
import { useJournal } from './contexts/JournalContext';

export default function HomePage() {
  const { todayJournal, fetchTodayJournal, updateJournal } = useJournal();
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  useEffect(() => {
    fetchTodayJournal();
  }, [fetchTodayJournal]);
  
  useEffect(() => {
    if (todayJournal) {
      setContent(todayJournal.content || '');
    }
  }, [todayJournal]);
  
  // 自动保存功能
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    if (content !== (todayJournal?.content || '') && content.trim() !== '') {
      const timer = setTimeout(() => {
        handleSave();
      }, 5000); // 5秒后自动保存
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [content]);
  
  const handleSave = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await updateJournal(content);
      setSaveMessage('已保存');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">今日随记</h1>
          <div className="flex items-center">
            {saveMessage && (
              <span className="text-sm text-green-600 mr-4">{saveMessage}</span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving || !content.trim()}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSaving || !content.trim() ? 'opacity-75 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
        
        {/* 日记编辑区 */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今天有什么想法？记录下你的感想、计划或者目标..."
              className="w-full h-64 p-4 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        
        {/* AI分析结果 */}
        {todayJournal?.aiAnalysis && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 bg-gray-50">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                AI分析
              </h3>
              {todayJournal.aiAnalysis.theme && (
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  主题：{todayJournal.aiAnalysis.theme}
                </p>
              )}
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {todayJournal.aiAnalysis.evaluation && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">评价</h4>
                  <p className="text-gray-700">{todayJournal.aiAnalysis.evaluation}</p>
                </div>
              )}
              
              {todayJournal.aiAnalysis.thinking && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-900 mb-2">思考过程</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{todayJournal.aiAnalysis.thinking}</p>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                {todayJournal.aiAnalysis.sentiment && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    情感：{todayJournal.aiAnalysis.sentiment}
                  </span>
                )}
                
                {todayJournal.aiAnalysis.depth && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    深度：{todayJournal.aiAnalysis.depth}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
