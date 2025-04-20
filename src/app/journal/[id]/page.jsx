import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

export default function JournalPage({ params }) {
  const { id } = params;
  
  // 这里使用相对路径导入组件，而不是使用@/路径别名
  const JournalEditor = dynamic(() => import('../../../components/journal/JournalEditor'), {
    loading: () => <p>加载编辑器中...</p>,
  });
  
  const AnalyzeButton = dynamic(() => import('../../../components/journal/AnalyzeButton'), {
    loading: () => <p>加载分析按钮中...</p>,
  });
  
  const TaskIdentifyButton = dynamic(() => import('../../../components/journal/TaskIdentifyButton'), {
    loading: () => <p>加载任务识别按钮中...</p>,
  });

  // 组件内容保持不变
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">日记详情</h1>
      <JournalEditor journalId={id} />
      <div className="flex space-x-4 mt-4">
        <AnalyzeButton journalId={id} />
        <TaskIdentifyButton journalId={id} />
      </div>
      <div className="mt-8">
        <Link href="/dashboard" className="text-blue-500 hover:underline">
          返回仪表盘
        </Link>
      </div>
    </div>
  );
}
