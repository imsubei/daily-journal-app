'use client';

import { useState, useEffect } from 'react';
import { useJournal } from '../contexts/JournalContext';
import { useTask } from '../contexts/TaskContext';

export default function TaskExtractor({ journalId, content }) {
  const { extractTasksFromJournal } = useTask();
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  const [extractedTasks, setExtractedTasks] = useState([]);
  const [error, setError] = useState(null);

  // 自动提取待办事项
  const extractTasks = async () => {
    if (!journalId || !content || extracting || extracted) return;
    
    setExtracting(true);
    setError(null);
    
    try {
      const tasks = await extractTasksFromJournal(journalId, content);
      setExtractedTasks(tasks);
      setExtracted(true);
    } catch (error) {
      console.error('提取待办事项失败:', error);
      setError('提取待办事项失败，请确保已设置DeepSeek API密钥');
    } finally {
      setExtracting(false);
    }
  };

  // 当日记内容变化时重置状态
  useEffect(() => {
    setExtracted(false);
    setExtractedTasks([]);
  }, [content]);

  // 当日记ID存在且内容不为空时，自动提取待办事项
  useEffect(() => {
    if (journalId && content && !extracted && !extracting) {
      extractTasks();
    }
  }, [journalId, content, extracted, extracting]);

  if (!journalId || !content) return null;

  return (
    <div className="mt-6">
      {extracting && (
        <div className="text-center py-4">
          <p className="text-gray-500">正在提取待办事项...</p>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {extracted && extractedTasks.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
          <h3 className="text-md font-medium text-blue-800 mb-2">
            已从日记中提取 {extractedTasks.length} 个待办事项
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {extractedTasks.map((task, index) => (
              <li key={index} className="text-blue-700">
                {task.content}
              </li>
            ))}
          </ul>
          <p className="text-sm text-blue-600 mt-2">
            这些待办事项已添加到您的任务列表中，系统将根据设置定期提醒您完成。
          </p>
        </div>
      )}
      
      {extracted && extractedTasks.length === 0 && (
        <div className="text-gray-500 text-sm">
          未从日记中发现待办事项
        </div>
      )}
    </div>
  );
}
