'use client';

import { useState, useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';

export default function TasksPage() {
  const { tasks, loading, error, fetchTasks, updateTask, deleteTask } = useTask();
  const [filter, setFilter] = useState('pending'); // 'all', 'pending', 'completed'
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    // 初始加载未完成的任务
    fetchTasks(false);
  }, []);

  useEffect(() => {
    if (tasks.length > 0) {
      if (filter === 'all') {
        setFilteredTasks(tasks);
      } else if (filter === 'pending') {
        setFilteredTasks(tasks.filter(task => !task.completed));
      } else if (filter === 'completed') {
        setFilteredTasks(tasks.filter(task => task.completed));
      }
    } else {
      setFilteredTasks([]);
    }
  }, [tasks, filter]);

  const handleFilterChange = async (newFilter) => {
    setFilter(newFilter);
    
    // 根据过滤条件从服务器获取任务
    if (newFilter === 'all') {
      await fetchTasks();
    } else if (newFilter === 'pending') {
      await fetchTasks(false);
    } else if (newFilter === 'completed') {
      await fetchTasks(true);
    }
  };

  const handleToggleComplete = async (id, completed) => {
    try {
      await updateTask(id, { completed: !completed });
    } catch (error) {
      console.error('更新任务状态失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这个待办事项吗？')) {
      try {
        await deleteTask(id);
      } catch (error) {
        console.error('删除任务失败:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '未完成';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">待办事项</h1>

      <div className="mb-6">
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            待完成
          </button>
          <button
            onClick={() => handleFilterChange('completed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            已完成
          </button>
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            全部
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {filter === 'pending'
              ? '暂无待完成事项'
              : filter === 'completed'
              ? '暂无已完成事项'
              : '暂无待办事项'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map(task => (
            <div
              key={task._id}
              className={`bg-white shadow overflow-hidden rounded-lg border-l-4 ${
                task.completed ? 'border-green-500' : 'border-yellow-500'
              }`}
            >
              <div className="px-4 py-4 sm:px-6 flex items-start">
                <div className="mr-4 flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task._id, task.completed)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-lg font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                    {task.content}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">来源：</span>
                    {task.originalText}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="font-medium">
                      {task.completed ? '完成时间：' : '创建时间：'}
                    </span>
                    {task.completed
                      ? formatDate(task.completedAt)
                      : formatDate(task.createdAt)}
                  </p>
                  {task.reminderCount > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="font-medium">已提醒：</span>
                      {task.reminderCount}次
                    </p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(task._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
