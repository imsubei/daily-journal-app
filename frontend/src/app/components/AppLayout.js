'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from './contexts/AuthContext';
import ReminderSystem from './components/ReminderSystem';

export default function AppLayout({ children }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 关闭移动菜单的函数
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // 处理登出
  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  // 导航链接
  const navLinks = [
    { href: '/', label: '今日随记', authRequired: true },
    { href: '/history', label: '历史记录', authRequired: true },
    { href: '/tasks', label: '待办事项', authRequired: true },
    { href: '/settings', label: '设置', authRequired: true },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* 导航栏 */}
      <nav className="bg-indigo-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="font-bold text-xl">每日随记</Link>
              </div>
              
              {/* 桌面导航链接 */}
              <div className="hidden md:ml-6 md:flex md:space-x-4">
                {navLinks.map((link) => (
                  !link.authRequired || isAuthenticated ? (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 rounded-md text-sm font-medium hover:bg-indigo-500"
                    >
                      {link.label}
                    </Link>
                  ) : null
                ))}
              </div>
            </div>
            
            {/* 用户菜单（桌面） */}
            <div className="hidden md:flex md:items-center">
              {isAuthenticated ? (
                <div className="flex items-center">
                  <span className="text-sm mr-4">
                    {user?.username || '用户'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 hover:bg-indigo-800"
                  >
                    退出
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-700 hover:bg-indigo-800"
                >
                  登录
                </Link>
              )}
            </div>
            
            {/* 移动菜单按钮 */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-indigo-200 hover:text-white hover:bg-indigo-500 focus:outline-none"
              >
                <span className="sr-only">打开主菜单</span>
                {/* 菜单图标 */}
                <svg
                  className={`${isMobileMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
                {/* 关闭图标 */}
                <svg
                  className={`${isMobileMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* 移动菜单 */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => (
              !link.authRequired || isAuthenticated ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ) : null
            ))}
            
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
              >
                退出
              </button>
            ) : (
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-500"
                onClick={closeMobileMenu}
              >
                登录
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* 主要内容 */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* 页脚 */}
      <footer className="bg-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} 每日随记与反拖延 | 记录每一天的感想与成长
          </p>
        </div>
      </footer>
      
      {/* 提醒系统 */}
      {isAuthenticated && <ReminderSystem />}
    </div>
  );
}
