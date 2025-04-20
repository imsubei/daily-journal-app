'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import JournalEditor from '@/components/journal/JournalEditor';

export default function NewJournalPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.authenticated) {
          setIsAuthenticated(true);
        } else {
          // 未登录，重定向到登录页面
          router.replace('/login');
        }
      } catch (error) {
        console.error('验证会话时出错:', error);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // 处理日记保存成功
  const handleSave = (journal) => {
    if (journal?.id) {
      router.push(`/journal/${journal.id}`);
    }
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

  if (!isAuthenticated) {
    return null; // 已经重定向到登录页面，不需要渲染内容
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">今日随记</h1>
      <JournalEditor onSave={handleSave} />
    </div>
  );
}
