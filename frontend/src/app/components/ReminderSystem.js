'use client';

import React, { useEffect, useState } from 'react';
import { useTask } from '../contexts/TaskContext';

export default function ReminderSystem() {
  const { tasks, updateTask } = useTask();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [isReminderVisible, setIsReminderVisible] = useState(false);
  
  // 过滤出未完成的任务
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const incomplete = tasks.filter(task => !task.completed);
      setPendingTasks(incomplete);
    }
  }, [tasks]);
  
  // 设置提醒定时器
  useEffect(() => {
    if (pendingTasks.length > 0) {
      const interval = setInterval(() => {
        // 随机选择一个未完成的任务进行提醒
        const randomIndex = Math.floor(Math.random() * pendingTasks.length);
        const taskToRemind = pendingTasks[randomIndex];
        
        setCurrentReminder(taskToRemind);
        setIsReminderVisible(true);
        
        // 更新提醒次数
        updateTask(taskToRemind._id, { 
          reminderCount: (taskToRemind.reminderCount || 0) + 1 
        });
        
        // 20秒后自动关闭提醒
        setTimeout(() => {
          setIsReminderVisible(false);
        }, 20000);
      }, 20 * 60 * 1000); // 每20分钟提醒一次
      
      return () => clearInterval(interval);
    }
  }, [pendingTasks, updateTask]);
  
  // 标记任务为已完成
  const handleCompleteTask = () => {
    if (currentReminder) {
      updateTask(currentReminder._id, { completed: true });
      setIsReminderVisible(false);
    }
  };
  
  // 暂时忽略提醒
  const handleDismissReminder = () => {
    setIsReminderVisible(false);
  };
  
  if (!isReminderVisible || !currentReminder) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 max-w-sm w-full bg-white rounded-lg shadow-lg p-4 border border-indigo-200 z-50">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-medium text-gray-900">待办事项提醒</h3>
        <button
          onClick={handleDismissReminder}
          className="text-gray-400 hover:text-gray-500"
        >
          <span className="sr-only">关闭</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <div className="mt-2">
        <p className="text-gray-700">{currentReminder.content}</p>
        <p className="text-sm text-gray-500 mt-1">
          这是第 {currentReminder.reminderCount || 1} 次提醒
        </p>
      </div>
      <div className="mt-4 flex space-x-3">
        <button
          onClick={handleCompleteTask}
          className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          标记为已完成
        </button>
        <button
          onClick={handleDismissReminder}
          className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
        >
          稍后提醒
        </button>
      </div>
    </div>
  );
}
