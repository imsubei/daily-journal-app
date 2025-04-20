'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export default function SettingsPage() {
  const { settings, loading, error, fetchSettings, updateSettings, updateApiKey, deleteApiKey } = useSettings();
  const [formData, setFormData] = useState({
    reminderInterval: 20,
    theme: 'system',
    emailNotifications: false,
    apiKey: ''
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const init = async () => {
      try {
        await fetchSettings();
      } catch (error) {
        console.error('获取设置失败:', error);
      }
    };
    
    init();
  }, []);

  useEffect(() => {
    if (settings) {
      setFormData({
        ...formData,
        reminderInterval: settings.reminderInterval,
        theme: settings.theme,
        emailNotifications: settings.emailNotifications
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    try {
      await updateSettings({
        reminderInterval: parseInt(formData.reminderInterval),
        theme: formData.theme,
        emailNotifications: formData.emailNotifications
      });
      
      setMessage({ type: 'success', text: '设置已保存' });
    } catch (error) {
      console.error('保存设置失败:', error);
      setMessage({ type: 'error', text: '保存设置失败' });
    }
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!formData.apiKey.trim()) {
      setMessage({ type: 'error', text: 'API密钥不能为空' });
      return;
    }
    
    try {
      await updateApiKey(formData.apiKey);
      setFormData({ ...formData, apiKey: '' });
      setMessage({ type: 'success', text: 'API密钥已保存' });
    } catch (error) {
      console.error('保存API密钥失败:', error);
      setMessage({ type: 'error', text: '保存API密钥失败' });
    }
  };

  const handleDeleteApiKey = async () => {
    if (window.confirm('确定要删除API密钥吗？这将禁用AI分析功能。')) {
      try {
        await deleteApiKey();
        setMessage({ type: 'success', text: 'API密钥已删除' });
      } catch (error) {
        console.error('删除API密钥失败:', error);
        setMessage({ type: 'error', text: '删除API密钥失败' });
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">设置</h1>

      {message.text && (
        <div
          className={`mb-6 p-4 rounded-md ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white shadow overflow-hidden rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">一般设置</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            调整应用的基本行为和外观
          </p>
        </div>
        <div className="border-t border-gray-200">
          <form onSubmit={handleSaveSettings} className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="reminderInterval" className="block text-sm font-medium text-gray-700">
                  提醒间隔（分钟）
                </label>
                <input
                  type="number"
                  name="reminderInterval"
                  id="reminderInterval"
                  min="5"
                  max="120"
                  value={formData.reminderInterval}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  未完成待办事项的提醒频率
                </p>
              </div>

              <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                  主题
                </label>
                <select
                  id="theme"
                  name="theme"
                  value={formData.theme}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="light">浅色</option>
                  <option value="dark">深色</option>
                  <option value="system">跟随系统</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  应用的显示主题
                </p>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="emailNotifications"
                      name="emailNotifications"
                      type="checkbox"
                      checked={formData.emailNotifications}
                      onChange={handleChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="emailNotifications" className="font-medium text-gray-700">
                      邮件通知
                    </label>
                    <p className="text-gray-500">
                      接收待办事项提醒和周报的邮件通知
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? '保存中...' : '保存设置'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h2 className="text-lg leading-6 font-medium text-gray-900">DeepSeek API设置</h2>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            配置AI分析功能所需的API密钥
          </p>
        </div>
        <div className="border-t border-gray-200">
          <form onSubmit={handleSaveApiKey} className="px-4 py-5 sm:p-6">
            <div className="space-y-6">
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  DeepSeek API密钥
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <input
                    type={showApiKey ? "text" : "password"}
                    name="apiKey"
                    id="apiKey"
                    value={formData.apiKey}
                    onChange={handleChange}
                    placeholder={settings?.hasApiKey ? "••••••••••••••••••••" : "输入您的DeepSeek API密钥"}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 sm:text-sm"
                  >
                    {showApiKey ? '隐藏' : '显示'}
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  用于AI分析功能，请从DeepSeek官网获取
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存API密钥'}
                </button>

                {settings?.hasApiKey && (
                  <button
                    type="button"
                    onClick={handleDeleteApiKey}
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                  >
                    删除API密钥
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
