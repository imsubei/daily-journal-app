'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import JournalEditor from '@/components/journal/JournalEditor';
import AnalyzeButton from '@/components/journal/AnalyzeButton';
import TaskIdentifyButton from '@/components/journal/TaskIdentifyButton';

export default function JournalDetailPage({ params }) {
  const [journal, setJournal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [identifiedTasks, setIdentifiedTasks] = useState([]);
  const [showTaskMessage, setShowTaskMessage] = useState(false);
  const router = useRouter();
  const { id } = params;

  // 获取日记详情
  useEffect(() => {
    const fetchJournal = async () => {
      try {
        const response = await fetch(`/api/journal/${id}`);
        
        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/login');
            return;
          }
          throw new Error('获取日记失败');
        }
        
        const data = await response.json();
        setJournal(data.journal);
      } catch (error) {
        console.error('获取日记详情时出错:', error);
        setError('无法加载日记，请重试或返回列表');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJournal();
    }
  }, [id, router]);

  // 处理日记保存
  const handleSave = (updatedJournal) => {
    setJournal(updatedJournal);
  };

  // 处理分析完成
  const handleAnalysisComplete = (analyzedJournal) => {
    setJournal(analyzedJournal);
  };

  // 处理任务识别完成
  const handleTasksIdentified = (tasks) => {
    setIdentifiedTasks(tasks);
    setShowTaskMessage(true);
    
    // 5秒后自动隐藏消息
    setTimeout(() => {
      setShowTaskMessage(false);
    }, 5000);
  };

  // 处理日记删除
  const handleDelete = async () => {
    if (!confirm('确定要删除这篇日记吗？此操作不可撤销。')) {
      return;
    }

    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除日记失败');
      }

      router.replace('/dashboard');
    } catch (error) {
      console.error('删除日记时出错:', error);
      alert('删除失败，请重试');
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
            返回日记列表
          </button>
        </div>
      </div>
    );
  }

  if (!journal) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">日记不存在或无权访问</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => router.push('/dashboard')}
        >
          返回日记列表
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">编辑日记</h1>
        <div className="flex space-x-2">
          <Link href="/tasks" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            查看任务
          </Link>
          <Link href="/settings/apikey" className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
            API设置
          </Link>
          <button
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            onClick={() => router.push('/dashboard')}
          >
            返回列表
          </button>
          <button
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            onClick={handleDelete}
          >
            删除
          </button>
        </div>
      </div>
      
      <div className="text-sm text-gray-500 mb-4">
        创建于: {new Date(journal.created_at).toLocaleString()}
        {journal.created_at !== journal.updated_at && 
          ` · 更新于: ${new Date(journal.updated_at).toLocaleString()}`}
      </div>
      
      <JournalEditor
        initialContent={journal.content}
        journalId={journal.id}
        onSave={handleSave}
      />
      
      {showTaskMessage && identifiedTasks.length > 0 && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            成功识别出 {identifiedTasks.length} 个任务！
            <Link href="/tasks" className="ml-2 underline">
              查看所有任务
            </Link>
          </p>
        </div>
      )}
      
      <div className="mt-8 flex justify-between items-start">
        <div className="flex space-x-4">
          <AnalyzeButton journalId={journal.id} onAnalysisComplete={handleAnalysisComplete} />
          <TaskIdentifyButton journalId={journal.id} onTasksIdentified={handleTasksIdentified} />
        </div>
      </div>
      
      {journal.ai_analysis ? (
        <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="mb-4">
            <span className="font-medium">情绪: </span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium ml-2">
              {journal.emotion_label || '未分析'}
            </span>
          </div>
          <div className="mb-4">
            <span className="font-medium">主题: </span>
            <span>{journal.ai_theme || '未分析'}</span>
          </div>
          <div className="mb-6">
            <span className="font-medium">分析: </span>
            <p className="mt-2 text-gray-700">{journal.ai_analysis}</p>
          </div>
          {journal.ai_thinking_process && (
            <div>
              <span className="font-medium">思考过程: </span>
              <div className="mt-2 p-4 bg-white rounded border border-gray-200 text-sm text-gray-600 whitespace-pre-line">
                {journal.ai_thinking_process}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center">
          <p className="text-gray-600 mb-4">尚未进行AI分析</p>
          <p className="text-sm text-gray-500 mb-2">点击"AI 分析内容"按钮，获取情绪分析、主题归纳和深度思考</p>
        </div>
      )}
    </div>
  );
}
