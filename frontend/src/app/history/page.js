'use client';

import { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useJournal } from '../contexts/JournalContext';

export default function HistoryPage() {
  const { journals, fetchAllJournals } = useJournal();
  const [selectedMonth, setSelectedMonth] = useState('');
  const [filteredJournals, setFilteredJournals] = useState([]);
  
  useEffect(() => {
    fetchAllJournals();
  }, [fetchAllJournals]);
  
  useEffect(() => {
    if (journals.length > 0) {
      if (selectedMonth) {
        setFilteredJournals(
          journals.filter(journal => {
            const journalDate = new Date(journal.createdAt);
            const monthYear = `${journalDate.getFullYear()}-${String(journalDate.getMonth() + 1).padStart(2, '0')}`;
            return monthYear === selectedMonth;
          })
        );
      } else {
        setFilteredJournals(journals);
      }
    }
  }, [journals, selectedMonth]);
  
  // 获取所有可用的月份
  const getAvailableMonths = () => {
    const months = new Set();
    journals.forEach(journal => {
      const journalDate = new Date(journal.createdAt);
      const monthYear = `${journalDate.getFullYear()}-${String(journalDate.getMonth() + 1).padStart(2, '0')}`;
      months.add(monthYear);
    });
    return Array.from(months).sort().reverse();
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">历史记录</h1>
        
        {/* 月份筛选 */}
        <div className="mb-6">
          <label htmlFor="month-select" className="block text-sm font-medium text-gray-700 mb-1">
            按月份筛选
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">所有月份</option>
            {getAvailableMonths().map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        
        {/* 日记列表 */}
        {filteredJournals.length > 0 ? (
          <div className="space-y-6">
            {filteredJournals.map(journal => {
              const journalDate = new Date(journal.createdAt);
              const formattedDate = journalDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              });
              
              return (
                <div key={journal._id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 bg-gray-50">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {formattedDate}
                    </h3>
                    {journal.aiAnalysis?.theme && (
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        主题：{journal.aiAnalysis.theme}
                      </p>
                    )}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <p className="text-gray-700 whitespace-pre-wrap">{journal.content}</p>
                    
                    {journal.aiAnalysis && (
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <h4 className="text-md font-medium text-gray-900 mb-2">AI分析</h4>
                        
                        {journal.aiAnalysis.evaluation && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700">评价</h5>
                            <p className="text-sm text-gray-600">{journal.aiAnalysis.evaluation}</p>
                          </div>
                        )}
                        
                        {journal.aiAnalysis.thinking && (
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-700">思考过程</h5>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">{journal.aiAnalysis.thinking}</p>
                          </div>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          {journal.aiAnalysis.sentiment && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              情感：{journal.aiAnalysis.sentiment}
                            </span>
                          )}
                          
                          {journal.aiAnalysis.depth && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              深度：{journal.aiAnalysis.depth}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {journals.length > 0 ? '没有找到符合条件的记录' : '暂无历史记录'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
