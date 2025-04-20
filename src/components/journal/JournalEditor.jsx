import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 日记编辑器组件
export default function JournalEditor({
  initialContent = '',
  journalId = null,
  onSave = () => {},
  autoSaveInterval = 5000, // 5秒自动保存
}) {
  const [content, setContent] = useState(initialContent);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [emotion, setEmotion] = useState('等待分析');
  const router = useRouter();

  // 初始化时获取情绪标签
  useEffect(() => {
    if (journalId) {
      fetchJournalEmotion(journalId);
    }
  }, [journalId]);

  // 获取日记的情绪标签
  const fetchJournalEmotion = async (id) => {
    try {
      const response = await fetch(`/api/journal/${id}`);
      
      if (!response.ok) {
        return;
      }
      
      const data = await response.json();
      
      if (data.journal?.emotion_label) {
        setEmotion(data.journal.emotion_label);
      }
    } catch (error) {
      console.error('获取情绪标签时出错:', error);
    }
  };

  // 处理内容变化
  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  // 保存日记
  const saveJournal = async () => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/journal' + (journalId ? `/${journalId}` : ''), {
        method: journalId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('保存失败');
      }

      const data = await response.json();
      
      // 如果是新建日记，获取ID并更新URL
      if (!journalId && data.journal?.id) {
        router.replace(`/journal/${data.journal.id}`);
      }
      
      setLastSaved(new Date());
      onSave(data.journal);
      
      // 更新情绪标签（如果API返回了）
      if (data.journal?.emotion_label) {
        setEmotion(data.journal.emotion_label);
      }
    } catch (error) {
      console.error('保存日记时出错:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 自动保存
  useEffect(() => {
    if (!content.trim()) return;
    
    const timer = setTimeout(() => {
      saveJournal();
    }, autoSaveInterval);

    return () => clearTimeout(timer);
  }, [content, autoSaveInterval]);

  // 获取情绪标签的样式
  const getEmotionStyle = (emotion) => {
    if (!emotion || emotion === '等待分析') return 'bg-gray-100 text-gray-800';
    
    const styles = {
      '愉快': 'bg-green-100 text-green-800',
      '积极': 'bg-blue-100 text-blue-800',
      '平静': 'bg-indigo-100 text-indigo-800',
      '中立': 'bg-gray-100 text-gray-800',
      '焦虑': 'bg-yellow-100 text-yellow-800',
      '悲伤': 'bg-purple-100 text-purple-800',
      '愤怒': 'bg-red-100 text-red-800'
    };
    
    return styles[emotion] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-4 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-2">
          <div className="text-sm text-gray-500">
            {lastSaved ? `上次保存: ${lastSaved.toLocaleTimeString()}` : '尚未保存'}
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">情绪:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEmotionStyle(emotion)}`}>
              {emotion}
            </span>
          </div>
        </div>
        <textarea
          className="w-full h-64 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="今天的感想..."
          value={content}
          onChange={handleContentChange}
        />
        <div className="flex justify-end mt-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
            onClick={saveJournal}
            disabled={isSaving || !content.trim()}
          >
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
