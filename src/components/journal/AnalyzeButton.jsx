'use client';

import { useState } from 'react';

export default function AnalyzeButton({ journalId, onAnalysisComplete }) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (isAnalyzing) return;
    
    setIsAnalyzing(true);
    setError('');
    
    try {
      const response = await fetch('/api/journal/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ journalId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '分析失败');
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(data.journal);
      }
    } catch (error) {
      console.error('分析日记时出错:', error);
      setError(error.message || '分析失败，请重试');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 disabled:opacity-50"
        onClick={handleAnalyze}
        disabled={isAnalyzing}
      >
        {isAnalyzing ? '分析中...' : 'AI 分析内容'}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
          {error.includes('API密钥') && (
            <a href="/settings/apikey" className="ml-2 underline">
              前往设置
            </a>
          )}
        </div>
      )}
    </div>
  );
}
