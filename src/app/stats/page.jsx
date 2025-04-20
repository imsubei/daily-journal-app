'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StatsPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const router = useRouter();

  // 获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/login');
            return;
          }
          throw new Error('获取统计数据失败');
        }
        
        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error('获取统计数据时出错:', error);
        setError('无法加载统计数据，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [router]);

  // 导出数据
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      const response = await fetch('/api/stats/export');
      
      if (!response.ok) {
        throw new Error('导出数据失败');
      }
      
      const data = await response.json();
      
      // 创建下载链接
      const dataStr = JSON.stringify(data.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `daily-journal-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('导出数据时出错:', error);
      alert('导出失败，请重试');
    } finally {
      setExportLoading(false);
    }
  };

  // 生成每周摘要
  const handleGenerateWeeklySummary = async () => {
    try {
      const response = await fetch('/api/stats/weekly-summary');
      
      if (!response.ok) {
        throw new Error('生成每周摘要失败');
      }
      
      const data = await response.json();
      
      if (data.isNew) {
        alert('成功生成新的每周摘要！');
      }
      
      router.push('/stats/weekly-summary');
    } catch (error) {
      console.error('生成每周摘要时出错:', error);
      alert('生成摘要失败，请重试');
    }
  };

  // 计算任务完成率
  const calculateCompletionRate = (stats) => {
    if (!stats || !stats.taskStats || stats.taskStats.total === 0) {
      return 0;
    }
    return ((stats.taskStats.completed / stats.taskStats.total) * 100).toFixed(1);
  };

  // 获取主要情绪
  const getMainEmotion = (stats) => {
    if (!stats || !stats.emotionStats || stats.emotionStats.length === 0) {
      return '暂无数据';
    }
    return stats.emotionStats[0].emotion_label;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-red-600">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => router.push('/dashboard')}
          >
            返回仪表盘
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">数据统计</h1>
        <div className="flex space-x-2">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            onClick={handleGenerateWeeklySummary}
          >
            生成每周摘要
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            onClick={handleExportData}
            disabled={exportLoading}
          >
            {exportLoading ? '导出中...' : '导出所有数据'}
          </button>
          <Link href="/dashboard" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            返回仪表盘
          </Link>
        </div>
      </div>

      {!stats ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">暂无统计数据</p>
          <p className="text-sm text-gray-500">
            继续记录日记和完成任务，这里将显示你的数据统计和分析
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 情绪概览卡片 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">情绪概览</h2>
            <div className="mb-4">
              <p className="text-gray-600">主要情绪: <span className="font-medium">{getMainEmotion(stats)}</span></p>
            </div>
            <div className="space-y-2">
              {stats.emotionStats && stats.emotionStats.map((emotion, index) => (
                <div key={index} className="flex items-center">
                  <div className="w-24 text-sm">{emotion.emotion_label}</div>
                  <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(emotion.count / stats.emotionStats[0].count) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-8 text-right text-sm ml-2">{emotion.count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 任务完成率卡片 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">任务完成率</h2>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#eee"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="3"
                    strokeDasharray={`${calculateCompletionRate(stats)}, 100`}
                  />
                </svg>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold">
                  {calculateCompletionRate(stats)}%
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">总任务数: {stats.taskStats?.total || 0}</p>
              <p className="text-sm text-gray-600">已完成: {stats.taskStats?.completed || 0}</p>
              <p className="text-sm text-gray-600">未完成: {(stats.taskStats?.total || 0) - (stats.taskStats?.completed || 0)}</p>
            </div>
          </div>

          {/* 主题分布卡片 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">主题分布</h2>
            {stats.themeStats && stats.themeStats.length > 0 ? (
              <div className="space-y-2">
                {stats.themeStats.map((theme, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-32 text-sm truncate" title={theme.ai_theme}>{theme.ai_theme}</div>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(theme.count / stats.themeStats[0].count) * 100}%` }}
                      ></div>
                    </div>
                    <div className="w-8 text-right text-sm ml-2">{theme.count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">暂无主题数据</p>
            )}
          </div>

          {/* 日记数量趋势卡片 */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">日记数量趋势</h2>
            {stats.journalCountTrend && stats.journalCountTrend.length > 0 ? (
              <div className="h-40 flex items-end space-x-1">
                {stats.journalCountTrend.map((item, index) => {
                  const maxCount = Math.max(...stats.journalCountTrend.map(i => i.count));
                  const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-blue-400 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                      <div className="text-xs mt-1 transform -rotate-45 origin-top-left">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500">暂无趋势数据</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">更多分析</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link 
            href="/stats/weekly-summary" 
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2">每周摘要</h3>
            <p className="text-sm text-gray-600">查看每周情绪和任务完成情况的摘要报告</p>
          </Link>
          <Link 
            href="/tasks" 
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <h3 className="font-medium mb-2">任务管理</h3>
            <p className="text-sm text-gray-600">查看和管理所有任务，提高完成率</p>
          </Link>
          <div 
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleExportData}
          >
            <h3 className="font-medium mb-2">数据导出</h3>
            <p className="text-sm text-gray-600">导出所有日记、任务和摘要数据</p>
          </div>
        </div>
      </div>
    </div>
  );
}
