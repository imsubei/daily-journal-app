'use client';

import { useState } from 'react';

export default function TaskIdentifyButton({ journalId, onTasksIdentified }) {
  const [isIdentifying, setIsIdentifying] = useState(false);
  const [error, setError] = useState('');

  const handleIdentifyTasks = async () => {
    if (isIdentifying) return;
    
    setIsIdentifying(true);
    setError('');
    
    try {
      const response = await fetch('/api/tasks/identify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ journalId }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '识别任务失败');
      }
      
      if (onTasksIdentified) {
        onTasksIdentified(data.tasks);
      }
    } catch (error) {
      console.error('识别任务时出错:', error);
      setError(error.message || '识别任务失败，请重试');
    } finally {
      setIsIdentifying(false);
    }
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
        onClick={handleIdentifyTasks}
        disabled={isIdentifying}
      >
        {isIdentifying ? '识别中...' : '识别计划任务'}
      </button>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
