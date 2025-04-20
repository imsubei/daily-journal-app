'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WeeklySummaryPage() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 获取每周摘要
  useEffect(() => {
    const fetchWeeklySummary = async () => {
      try {
        const response = await fetch('/api/stats/weekly-summary');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/login');
            return;
          }
          throw new Error('获取每周摘要失败');
        }
        
        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        console.error('获取每周摘要时出错:', error);
        setError('无法加载每周摘要，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeeklySummary();
  }, [router]);

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
            onClick={() => router.push('/stats')}
          >
            返回统计页面
          </button>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">暂无每周摘要</h2>
          <p className="text-gray-600 mb-6">
            你还没有生成每周摘要，或者本周还没有足够的数据来生成摘要。
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={() => router.push('/stats')}
            >
              返回统计页面
            </button>
            <Link href="/journal/new" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              写新日记
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">每周摘要</h1>
        <div className="flex space-x-2">
          <Link href="/stats" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            返回统计页面
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">
            {formatDate(summary.week_start_date)} 至 {formatDate(summary.week_end_date)}
          </h2>
          <p className="text-sm text-gray-500">
            生成于: {new Date(summary.created_at).toLocaleString()}
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">任务完成率</h3>
          <div className="flex items-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-500 flex items-center justify-center mr-4">
              <span className="text-xl font-bold">{summary.task_completion_rate.toFixed(1)}%</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">
                本周任务完成率为 {summary.task_completion_rate.toFixed(1)}%
              </p>
              {summary.task_completion_rate >= 80 ? (
                <p className="text-sm text-green-600">太棒了！你的完成率非常高。</p>
              ) : summary.task_completion_rate >= 50 ? (
                <p className="text-sm text-blue-600">不错的表现，继续保持！</p>
              ) : (
                <p className="text-sm text-yellow-600">有进步的空间，下周继续加油！</p>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">主题回顾</h3>
          {summary.theme_summary ? (
            <div className="flex flex-wrap gap-2">
              {summary.theme_summary.split(', ').map((theme, index) => (
                <span key={index} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  {theme}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600">本周没有记录主题</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">情绪分析</h3>
          {summary.emotion_stats ? (
            <div>
              {(() => {
                try {
                  const emotions = JSON.parse(summary.emotion_stats);
                  if (emotions.length === 0) {
                    return <p className="text-sm text-gray-600">本周没有记录情绪</p>;
                  }
                  return (
                    <div className="space-y-2">
                      {emotions.map((emotion, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-24 text-sm">{emotion.emotion_label}</div>
                          <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${(emotion.count / emotions[0].count) * 100}%` }}
                            ></div>
                          </div>
                          <div className="w-8 text-right text-sm ml-2">{emotion.count}</div>
                        </div>
                      ))}
                    </div>
                  );
                } catch (e) {
                  return <p className="text-sm text-gray-600">无法解析情绪数据</p>;
                }
              })()}
            </div>
          ) : (
            <p className="text-sm text-gray-600">本周没有记录情绪</p>
          )}
        </div>

        <div>
          <h3 className="font-medium mb-2">详细摘要</h3>
          <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-line text-gray-700">
            {summary.generated_content}
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <Link href="/journal/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          写新日记
        </Link>
        <Link href="/tasks" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          查看任务
        </Link>
      </div>
    </div>
  );
}
