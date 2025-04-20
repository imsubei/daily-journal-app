'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // 获取任务列表
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('/api/tasks');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/login');
            return;
          }
          throw new Error('获取任务列表失败');
        }
        
        const data = await response.json();
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('获取任务列表时出错:', error);
        setError('无法加载任务列表，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [router]);

  // 标记任务完成/未完成
  const handleToggleTaskStatus = async (taskId, currentStatus) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_completed: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('更新任务状态失败');
      }
      
      // 更新本地任务列表
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, is_completed: !currentStatus } : task
      ));
    } catch (error) {
      console.error('更新任务状态时出错:', error);
      alert('更新失败，请重试');
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId) => {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除任务失败');
      }
      
      // 更新本地任务列表
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('删除任务时出错:', error);
      alert('删除失败，请重试');
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '未设置';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // 获取任务状态样式
  const getTaskStatusStyle = (task) => {
    if (task.is_completed) {
      return 'bg-green-100 text-green-800';
    }
    
    if (!task.deadline) {
      return 'bg-gray-100 text-gray-800';
    }
    
    const now = new Date();
    const deadline = new Date(task.deadline);
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'bg-red-100 text-red-800';
    } else if (diffDays <= 1) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-blue-100 text-blue-800';
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
        <h1 className="text-2xl font-bold">我的任务</h1>
        <div className="flex space-x-2">
          <Link href="/dashboard" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            返回仪表盘
          </Link>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">你还没有任何任务</p>
          <p className="text-sm text-gray-500">
            在写日记时，系统会自动识别你计划做的事情，并创建相应的任务
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div 
              key={task.id}
              className={`p-4 rounded-lg border ${task.is_completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={task.is_completed === 1}
                    onChange={() => handleToggleTaskStatus(task.id, task.is_completed === 1)}
                    className="mt-1 h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <p className={`font-medium ${task.is_completed === 1 ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.task_description}
                    </p>
                    <div className="mt-1 flex items-center space-x-2 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${getTaskStatusStyle(task)}`}>
                        {task.is_completed === 1 ? '已完成' : (task.deadline ? `截止: ${formatDate(task.deadline)}` : '无截止日期')}
                      </span>
                      {task.journal_id && (
                        <Link href={`/journal/${task.journal_id}`} className="text-blue-600 hover:underline">
                          查看相关日记
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
