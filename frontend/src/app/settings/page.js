'use client';

import { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useSettings } from '../contexts/SettingsContext';

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const [apiKey, setApiKey] = useState(settings?.deepseekApiKey || '');
  const [reminderInterval, setReminderInterval] = useState(
    settings?.reminderInterval || 20
  );
  const [darkMode, setDarkMode] = useState(settings?.darkMode || false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      await updateSettings({
        deepseekApiKey: apiKey,
        reminderInterval: parseInt(reminderInterval),
        darkMode
      });
      
      setSaveMessage('设置已保存');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      setSaveMessage('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6">设置</h1>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* DeepSeek API Key */}
                <div>
                  <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                    DeepSeek API Key
                  </label>
                  <div className="mt-1">
                    <input
                      type="password"
                      name="api-key"
                      id="api-key"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="sk-..."
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    用于AI分析功能。您可以从DeepSeek官网获取API密钥。
                  </p>
                </div>
                
                {/* 提醒间隔 */}
                <div>
                  <label htmlFor="reminder-interval" className="block text-sm font-medium text-gray-700">
                    提醒间隔（分钟）
                  </label>
                  <div className="mt-1">
                    <input
                      type="number"
                      name="reminder-interval"
                      id="reminder-interval"
                      min="5"
                      max="120"
                      value={reminderInterval}
                      onChange={(e) => setReminderInterval(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    未完成待办事项的提醒间隔时间。
                  </p>
                </div>
                
                {/* 暗黑模式 */}
                <div className="flex items-center">
                  <input
                    id="dark-mode"
                    name="dark-mode"
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => setDarkMode(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="dark-mode" className="ml-2 block text-sm text-gray-900">
                    启用暗黑模式
                  </label>
                </div>
                
                {/* 保存按钮 */}
                <div className="flex items-center justify-between">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      isSaving ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSaving ? '保存中...' : '保存设置'}
                  </button>
                  
                  {saveMessage && (
                    <span className="text-sm text-green-600">{saveMessage}</span>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
        
        {/* 数据导出 */}
        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              数据导出
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                导出您的所有日记和待办事项数据。
              </p>
            </div>
            <div className="mt-5">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                导出数据
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
