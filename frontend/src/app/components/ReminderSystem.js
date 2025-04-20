'use client';

import { useState, useEffect } from 'react';
import { useTask } from '../contexts/TaskContext';
import { useSettings } from '../contexts/SettingsContext';

export default function ReminderSystem() {
  const { tasks, fetchTasks, updateTask, updateReminderStatus } = useTask();
  const { settings, fetchSettings } = useSettings();
  const [pendingTasks, setPendingTasks] = useState([]);
  const [currentReminder, setCurrentReminder] = useState(null);
  const [showReminder, setShowReminder] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // 初始化
  useEffect(() => {
    const init = async () => {
      await fetchSettings();
      await fetchTasks(false); // 获取未完成的任务
      setInitialized(true);
    };
    
    init();
  }, []);

  // 监听未完成任务变化
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      setPendingTasks(tasks.filter(task => !task.completed));
    } else {
      setPendingTasks([]);
    }
  }, [tasks]);

  // 提醒系统
  useEffect(() => {
    if (!initialized || pendingTasks.length === 0 || !settings) return;
    
    const reminderInterval = settings.reminderInterval * 60 * 1000; // 转换为毫秒
    
    // 检查是否有任务需要提醒
    const checkReminders = () => {
      const now = new Date();
      
      // 找出需要提醒的任务
      const tasksToRemind = pendingTasks.filter(task => {
        // 如果从未提醒过，或者上次提醒时间已经超过了提醒间隔
        return !task.lastReminderTime || 
               (now - new Date(task.lastReminderTime)) > reminderInterval;
      });
      
      if (tasksToRemind.length > 0) {
        // 选择一个任务进行提醒
        const taskToRemind = tasksToRemind[0];
        setCurrentReminder(taskToRemind);
        setShowReminder(true);
        
        // 更新提醒状态
        updateReminderStatus(taskToRemind._id);
      }
    };
    
    // 立即检查一次
    checkReminders();
    
    // 设置定期检查
    const intervalId = setInterval(checkReminders, 60000); // 每分钟检查一次
    
    return () => clearInterval(intervalId);
  }, [initialized, pendingTasks, settings]);

  // 处理任务完成
  const handleCompleteTask = async () => {
    if (!currentReminder) return;
    
    try {
      await updateTask(currentReminder._id, { completed: true });
      setShowReminder(false);
      setCurrentReminder(null);
    } catch (error) {
      console.error('完成任务失败:', error);
    }
  };

  // 处理稍后提醒
  const handleRemindLater = () => {
    setShowReminder(false);
    setCurrentReminder(null);
  };

  if (!showReminder || !currentReminder) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 m-4 max-w-sm w-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">待办事项提醒</h3>
          <p className="text-sm text-gray-500">
            这个任务已经等待完成一段时间了
          </p>
        </div>
        
        <div className="mb-6 p-4 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-gray-800 font-medium">{currentReminder.content}</p>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">来源：</span>
            {currentReminder.originalText}
          </p>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={handleRemindLater}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            稍后提醒
          </button>
          <button
            onClick={handleCompleteTask}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            标记为已完成
          </button>
        </div>
      </div>
    </div>
  );
}
