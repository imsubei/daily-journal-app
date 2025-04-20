'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  // 检查用户登录状态
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          setIsLoggedIn(!!data.user);
        }
      } catch (error) {
        console.error('检查会话状态时出错:', error);
      }
    };

    checkSession();
  }, []);

  // 检查暗色模式偏好
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // 切换暗色模式
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  // 处理登出
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        window.location.href = '/login';
      }
    } catch (error) {
      console.error('登出时出错:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container container">
        <Link href="/" className="navbar-brand">
          每日随记
        </Link>
        
        <div className="flex items-center">
          <button 
            className="theme-toggle mr-4"
            onClick={toggleDarkMode}
            aria-label={isDarkMode ? '切换到亮色模式' : '切换到暗色模式'}
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          <button 
            className="mobile-menu md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? '关闭菜单' : '打开菜单'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        
        <div className={`navbar-nav ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>
                仪表盘
              </Link>
              <Link href="/journal/new" className={`nav-link ${pathname === '/journal/new' ? 'active' : ''}`}>
                写日记
              </Link>
              <Link href="/tasks" className={`nav-link ${pathname === '/tasks' ? 'active' : ''}`}>
                任务
              </Link>
              <Link href="/stats" className={`nav-link ${pathname === '/stats' ? 'active' : ''}`}>
                统计
              </Link>
              <Link href="/settings/apikey" className={`nav-link ${pathname === '/settings/apikey' ? 'active' : ''}`}>
                设置
              </Link>
              <button onClick={handleLogout} className="btn btn-outline">
                登出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={`nav-link ${pathname === '/login' ? 'active' : ''}`}>
                登录
              </Link>
              <Link href="/register" className={`nav-link ${pathname === '/register' ? 'active' : ''}`}>
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
