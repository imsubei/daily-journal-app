'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function RootLayout({ children }) {
  const [mounted, setMounted] = useState(false);

  // 确保在客户端渲染后再显示内容，避免日夜模式闪烁
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <html lang="zh-CN">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="每日随记与反拖延 - 记录每日感想，克服拖延习惯" />
        <title>每日随记</title>
      </head>
      <body>
        {mounted && (
          <>
            <Navbar />
            <main className="min-h-screen pt-4 pb-12">
              {children}
            </main>
            <footer className="py-6 bg-white border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="container mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                <p>每日随记与反拖延 &copy; {new Date().getFullYear()}</p>
                <p className="mt-2">记录每日感想，克服拖延习惯，提升自我认知</p>
              </div>
            </footer>
          </>
        )}
      </body>
    </html>
  );
}
