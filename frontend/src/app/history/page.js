'use client';

import { useState, useEffect } from 'react';
import { useJournal } from '../contexts/JournalContext';
import Link from 'next/link';

export default function HistoryPage() {
  const { journals, loading, error, fetchAllJournals, deleteJournal } = useJournal();
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [filteredJournals, setFilteredJournals] = useState([]);

  useEffect(() => {
    fetchAllJournals();
  }, []);

  useEffect(() => {
    if (journals.length > 0) {
      if (selectedMonth === 'all') {
        setFilteredJournals(journals);
      } else {
        const [year, month] = selectedMonth.split('-');
        setFilteredJournals(
          journals.filter(journal => {
            const date = new Date(journal.date);
            return date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month) - 1;
          })
        );
      }
    }
  }, [journals, selectedMonth]);

  // 获取所有可用的年月选项
  const getMonthOptions = () => {
    const options = new Set();
    journals.forEach(journal => {
      const date = new Date(journal.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      options.add(`${year}-${month.toString().padStart(2, '0')}`);
    });
    return Array.from(options).sort().reverse();
  };

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这篇日记吗？')) {
      try {
        await deleteJournal(id);
      } catch (error) {
        console.error('删除日记失败:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">历史记录</h1>

      <div className="mb-6">
        <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
          选择月份
        </label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="all">全部</option>
          {getMonthOptions().map(option => (
            <option key={option} value={option}>
              {option.split('-')[0]}年{option.split('-')[1]}月
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">加载中...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      ) : filteredJournals.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">暂无日记记录</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJournals.map(journal => (
            <div key={journal._id} className="bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {formatDate(journal.date)}
                </h3>
                <div className="flex space-x-2">
                  <Link href={`/journal/${journal._id}`}>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700">
                      查看
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(journal._id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <p className="text-gray-900 line-clamp-3 whitespace-pre-wrap">
                    {journal.content}
                  </p>
                </div>
                {journal.isAnalyzed && (
                  <div className="border-t border-gray-200 px-4 py-3 sm:px-6 bg-gray-50">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">主题：</span>
                      {journal.aiAnalysis.theme}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
