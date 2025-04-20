'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ApiKeySettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [maskedApiKey, setMaskedApiKey] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const router = useRouter();

  // 获取用户的API密钥状态
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('/api/settings/apikey');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.replace('/login');
            return;
          }
          throw new Error('获取API密钥失败');
        }
        
        const data = await response.json();
        setHasApiKey(data.hasApiKey);
        if (data.apiKey?.masked) {
          setMaskedApiKey(data.apiKey.masked);
        }
      } catch (error) {
        console.error('获取API密钥时出错:', error);
        setError('无法加载API密钥信息，请重试');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, [router]);

  // 保存API密钥
  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      setError('请输入API密钥');
      return;
    }
    
    setIsSaving(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/settings/apikey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });
      
      if (!response.ok) {
        throw new Error('保存API密钥失败');
      }
      
      const data = await response.json();
      setSuccess('API密钥保存成功');
      setHasApiKey(true);
      setMaskedApiKey(`${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
      setApiKey('');
      setShowApiKey(false);
    } catch (error) {
      console.error('保存API密钥时出错:', error);
      setError('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 删除API密钥
  const handleDeleteApiKey = async () => {
    if (!confirm('确定要删除API密钥吗？删除后将无法使用AI分析功能。')) {
      return;
    }
    
    setIsDeleting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/settings/apikey', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('删除API密钥失败');
      }
      
      setSuccess('API密钥已删除');
      setHasApiKey(false);
      setMaskedApiKey('');
    } catch (error) {
      console.error('删除API密钥时出错:', error);
      setError('删除失败，请重试');
    } finally {
      setIsDeleting(false);
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">API密钥设置</h1>
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800">
            返回仪表盘
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">DeepSeek API密钥</h2>
          
          <p className="text-gray-600 mb-4">
            DeepSeek API用于分析日记内容，识别情绪，归纳主题，并提供AI评价。
            您需要提供自己的API密钥才能使用这些功能。
          </p>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-md mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 p-4 rounded-md mb-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}
          
          {hasApiKey ? (
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">当前API密钥:</p>
              <div className="flex items-center">
                <span className="font-mono bg-gray-100 px-3 py-2 rounded">{maskedApiKey}</span>
                <button
                  className="ml-2 text-sm text-blue-600 hover:text-blue-800"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? '隐藏' : '更新'}
                </button>
                <button
                  className="ml-4 text-sm text-red-600 hover:text-red-800"
                  onClick={handleDeleteApiKey}
                  disabled={isDeleting}
                >
                  {isDeleting ? '删除中...' : '删除'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-yellow-600 mb-4">
              您尚未设置API密钥，无法使用AI分析功能。
            </p>
          )}
          
          {(!hasApiKey || showApiKey) && (
            <form onSubmit={handleSaveApiKey}>
              <div className="mb-4">
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                  输入DeepSeek API密钥
                </label>
                <input
                  id="apiKey"
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                />
              </div>
              <div className="flex justify-end">
                {showApiKey && (
                  <button
                    type="button"
                    className="px-4 py-2 mr-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                    onClick={() => setShowApiKey(false)}
                  >
                    取消
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  disabled={isSaving || !apiKey.trim()}
                >
                  {isSaving ? '保存中...' : '保存API密钥'}
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-2">如何获取DeepSeek API密钥</h3>
          <ol className="list-decimal list-inside text-gray-700 space-y-2">
            <li>访问 <a href="https://platform.deepseek.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">DeepSeek平台</a></li>
            <li>注册或登录您的账号</li>
            <li>在控制台中找到"API密钥"选项</li>
            <li>创建新的API密钥</li>
            <li>复制密钥并粘贴到上方输入框中</li>
          </ol>
          <p className="mt-4 text-sm text-gray-500">
            注意：API密钥是敏感信息，请妥善保管。我们会安全地存储您的密钥，并且只用于处理您的日记内容。
          </p>
        </div>
      </div>
    </div>
  );
}
