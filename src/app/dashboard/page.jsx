'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const [journals, setJournals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  // 检查用户是否已登录并获取日记列表
  useEffect(() => {
    const checkAuthAndFetchJournals = async () => {
      try {
        // 检查用户会话
        const sessionResponse = await fetch('/api/auth/session');
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.authenticated) {
          router.replace('/login');
          return;
        }
        
        setUser(sessionData.user);
        
        // 获取日记列表
        const journalsResponse = await fetch('/api/journal');
        
        if (!journalsResponse.ok) {
          throw new Error('获取日记列表失败');
        }
        
        const journalsData = await journalsResponse.json();
        setJournals(journalsData.journals || []);
      } catch (error) {
        console.error('获取数据时出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndFetchJournals();
  }, [router]);

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 截断文本
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // 获取情绪标签的样式
  const getEmotionStyle = (emotion) => {
    if (!emotion) return 'bg-gray-100 text-gray-800';
    
    const styles = {
      '愉快': 'bg-green-100 text-green-800',
      '积极': 'bg-blue-100 text-blue-800',
      '平静': 'bg-indigo-100 text-indigo-800',
      '中立': 'bg-gray-100 text-gray-800',
      '焦虑': 'bg-yellow-100 text-yellow-800',
      '悲伤': 'bg-purple-100 text-purple-800',
      '愤怒': 'bg-red-100 text-red-800'
    };
    
    return styles[emotion] || 'bg-gray-100 text-gray-800';
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">我的日记</h1>
          {user && <p className="text-gray-600">欢迎回来，{user.username}</p>}
        </div>
        <div className="flex space-x-2">
          <Link href="/journal/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            写新日记
          </Link>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            onClick={() => fetch('/api/auth/logout', { method: 'POST' }).then(() => router.replace('/login'))}
          >
            退出登录
          </button>
        </div>
      </div>

      {journals.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">你还没有写过日记</p>
          <Link href="/journal/new" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            开始写第一篇
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((journal) => (
            <Link 
              href={`/journal/${journal.id}`} 
              key={journal.id}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="text-sm text-gray-500">
                    {formatDate(journal.created_at)}
                  </div>
                  {journal.emotion_label && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionStyle(journal.emotion_label)}`}>
                      {journal.emotion_label}
                    </span>
                  )}
                </div>
                <div className="mb-3">
                  <p className="text-gray-800">{truncateText(journal.content)}</p>
                </div>
                {journal.ai_theme && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">主题: </span>
                    {journal.ai_theme}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
