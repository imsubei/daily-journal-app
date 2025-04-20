'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 检查用户登录状态
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setIsLoggedIn(true);
            // 如果已登录，重定向到仪表盘
            router.replace('/dashboard');
          }
        }
      } catch (error) {
        console.error('检查会话状态时出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="text-center">
          <div className="loading-spinner mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return null; // 已登录用户会被重定向，这里不需要渲染内容
  }

  return (
    <div className="container mx-auto px-4">
      <section className="py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 fade-in">每日随记与反拖延</h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto slide-in">
          记录每日感想，分析情绪变化，克服拖延习惯，提升自我认知
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 slide-in">
          <Link href="/register" className="btn btn-primary text-center">
            立即注册
          </Link>
          <Link href="/login" className="btn btn-outline text-center">
            登录账号
          </Link>
        </div>
      </section>

      <section className="py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="card p-6 text-center fade-in">
          <div className="text-primary-color mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3">记录日常感想</h2>
          <p className="text-gray-600">
            简洁大方的编辑界面，随时记录你的想法和感受，AI自动分析情绪和主题
          </p>
        </div>

        <div className="card p-6 text-center fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-secondary-color mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3">克服拖延习惯</h2>
          <p className="text-gray-600">
            自动识别你计划做的事情，设置提醒，追踪完成状态，帮助你告别拖延
          </p>
        </div>

        <div className="card p-6 text-center fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="text-primary-color mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-3">数据可视化</h2>
          <p className="text-gray-600">
            直观展示情绪变化趋势和任务完成率，每周自动生成成长摘要，帮助自我认知
          </p>
        </div>
      </section>

      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-8">为什么选择每日随记？</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-2">AI情绪分析</h3>
              <p className="text-gray-600">自动识别你的情绪状态，帮助你了解自己的情感变化</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-2">智能任务识别</h3>
              <p className="text-gray-600">自动从日记中提取你计划做的事情，无需手动创建任务</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-2">每周成长摘要</h3>
              <p className="text-gray-600">自动生成每周情绪和任务完成情况的摘要报告</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="font-medium mb-2">隐私保护</h3>
              <p className="text-gray-600">所有内容默认私密，只有你自己可见，支持本地导出数据</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-6">开始你的自我成长之旅</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          每天几分钟，记录感想，克服拖延，提升自我认知，成为更好的自己
        </p>
        <Link href="/register" className="btn btn-primary">
          立即开始
        </Link>
      </section>
    </div>
  );
}
