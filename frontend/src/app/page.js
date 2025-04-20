'use client';

import { useState, useEffect } from 'react';
import { useJournal } from '../contexts/JournalContext';
import { useTask } from '../contexts/TaskContext';
import { useSettings } from '../contexts/SettingsContext';

export default function JournalPage() {
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { currentJournal, loading, error, fetchTodayJournal, saveJournal, analyzeJournal } = useJournal();
  const { extractTasksFromJournal } = useTask();
  const { settings, fetchSettings } = useSettings();
  const [analyzing, setAnalyzing] = useState(false);

  // 初始化时获取今日日记和用户设置
  useEffect(() => {
    const init = async () => {
      await fetchSettings();
      const journal = await fetchTodayJournal();
      if (journal) {
        setContent(journal.content);
        if (journal.isAnalyzed) {
          setShowAnalysis(true);
        }
      }
    };
    
    init();
  }, []);

  // 保存日记内容
  const handleSave = async () => {
    if (!content.trim()) return;
    
    try {
      const journal = await saveJournal(content);
      setIsEditing(false);
      
      // 如果有API密钥，自动分析内容
      if (settings.hasApiKey) {
        handleAnalyze(journal._id);
      }
    } catch (error) {
      console.error('保存日记失败:', error);
    }
  };

  // 分析日记内容
  const handleAnalyze = async (journalId) => {
    if (!settings.hasApiKey) {
      alert('请先在设置中添加DeepSeek API密钥');
      return;
    }
    
    setAnalyzing(true);
    try {
      await analyzeJournal(journalId || currentJournal._id, content);
      setShowAnalysis(true);
      
      // 提取待办事项
      await extractTasksFromJournal(journalId || currentJournal._id, content);
    } catch (error) {
      console.error('分析日记失败:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">今日随记</h1>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">
            {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </h2>
          <div>
            {isEditing ? (
              <button
                onClick={handleSave}
                disabled={loading || !content.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 mr-2"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 mr-2"
              >
                编辑
              </button>
            )}
            
            {!isEditing && currentJournal && !currentJournal.isAnalyzed && (
              <button
                onClick={() => handleAnalyze()}
                disabled={analyzing || !settings.hasApiKey}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
              >
                {analyzing ? '分析中...' : '分析内容'}
              </button>
            )}
          </div>
        </div>
        
        {isEditing ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天的感想、想法或计划..."
            className="w-full h-64 p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <div className="w-full min-h-64 p-4 border border-gray-300 rounded-md whitespace-pre-wrap">
            {content || '今天还没有记录内容'}
          </div>
        )}
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {showAnalysis && currentJournal && currentJournal.isAnalyzed && (
        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">AI 分析结果</h3>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-1">主题归纳</h4>
            <p className="text-gray-900 p-2 bg-white rounded border border-gray-200">
              {currentJournal.aiAnalysis.theme || '暂无主题归纳'}
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-1">内容评价</h4>
            <p className="text-gray-900 p-2 bg-white rounded border border-gray-200">
              {currentJournal.aiAnalysis.evaluation || '暂无内容评价'}
            </p>
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-1">思考过程</h4>
            <p className="text-gray-900 p-2 bg-white rounded border border-gray-200 whitespace-pre-wrap">
              {currentJournal.aiAnalysis.thoughtProcess || '暂无思考过程'}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-1">情感色彩</h4>
              <p className="text-gray-900 p-2 bg-white rounded border border-gray-200">
                {currentJournal.aiAnalysis.sentiment === 'positive' && '积极正向'}
                {currentJournal.aiAnalysis.sentiment === 'neutral' && '中性平和'}
                {currentJournal.aiAnalysis.sentiment === 'negative' && '消极负面'}
                {!currentJournal.aiAnalysis.sentiment && '暂无情感分析'}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-1">深度评估</h4>
              <p className="text-gray-900 p-2 bg-white rounded border border-gray-200">
                {currentJournal.aiAnalysis.depth === 'shallow' && '浅层思考'}
                {currentJournal.aiAnalysis.depth === 'moderate' && '中等深度'}
                {currentJournal.aiAnalysis.depth === 'deep' && '深度思考'}
                {!currentJournal.aiAnalysis.depth && '暂无深度评估'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
