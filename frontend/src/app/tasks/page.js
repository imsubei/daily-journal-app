'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useTasks } from '../contexts/TaskContext';

export default function TasksPage() {
  const { tasks, fetchTasks, updateTask } = useTasks();
  const [filter, setFilter] = useState('all'); // all, pending, completed
  
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);
  
  const handleToggleComplete = async (taskId, isCompleted) => {
    await updateTask(taskId, { completed: !isCompleted });
  };
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">待办事项</h1>
        
        {/* 过滤器 */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              待完成
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              已完成
            </button>
          </div>
        </div>
        
        {/* 任务列表 */}
        {filteredTasks.length > 0 ? (
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div
                key={task._id}
                className={`flex items-center p-4 border rounded-lg ${
                  task.completed ? 'bg-gray-50' : 'bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task._id, task.completed)}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="ml-4 flex-1">
                  <p className={`text-gray-900 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                    {task.content}
                  </p>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span>
                      来自日记：{new Date(task.journalDate).toLocaleDateString('zh-CN')}
                    </span>
                    <span className="mx-2">•</span>
                    <span>
                      提醒次数：{task.reminderCount}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {tasks.length > 0 ? '没有找到符合条件的待办事项' : '暂无待办事项'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
