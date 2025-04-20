const axios = require('axios');
const Settings = require('../models/Settings');
const Task = require('../models/Task');

// DeepSeek API服务
class DeepSeekService {
  constructor() {
    this.baseUrl = 'https://api.deepseek.com/v1';
  }

  // 获取用户的API密钥
  async getUserApiKey(userId) {
    try {
      const settings = await Settings.findOne({ user: userId }).select('+deepseekApiKey');
      if (!settings || !settings.deepseekApiKey) {
        throw new Error('未设置DeepSeek API密钥');
      }
      return settings.deepseekApiKey;
    } catch (error) {
      console.error('获取API密钥失败:', error);
      throw error;
    }
  }

  // 创建API请求头
  createHeaders(apiKey) {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
  }

  // 分析日记内容
  async analyzeJournal(userId, content) {
    try {
      const apiKey = await this.getUserApiKey(userId);
      
      const prompt = `
请分析以下日记内容，并提供以下信息：
1. 主题归纳：提炼句子的重点和主旨（简洁明了，不超过30字）
2. 内容评价：对内容的情感色彩、积极性、深刻度等方面的评价（100-200字）
3. 思考过程：详细说明你是如何分析到这些评价点的（300-500字）
4. 情感分类：将内容情感分为"positive"（积极正向）、"neutral"（中性平和）或"negative"（消极负面）之一
5. 深度分类：将内容深度分为"shallow"（浅层思考）、"moderate"（中等深度）或"deep"（深度思考）之一

日记内容：
${content}

请按以下JSON格式返回结果（不要包含其他内容）：
{
  "theme": "主题归纳结果",
  "evaluation": "内容评价结果",
  "thoughtProcess": "思考过程结果",
  "sentiment": "情感分类结果",
  "depth": "深度分类结果"
}
      `;
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的日记分析助手，擅长分析文本内容并提供深入见解。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        { headers: this.createHeaders(apiKey) }
      );
      
      // 解析返回的JSON结果
      const assistantMessage = response.data.choices[0].message.content;
      const analysisResult = JSON.parse(assistantMessage);
      
      return analysisResult;
    } catch (error) {
      console.error('分析日记内容失败:', error);
      throw error;
    }
  }

  // 从日记内容提取待办事项
  async extractTasks(userId, content, journalId) {
    try {
      const apiKey = await this.getUserApiKey(userId);
      
      const prompt = `
请从以下日记内容中提取所有待办事项或计划做的事情。
- 识别所有包含"我要做..."、"计划做..."、"需要完成..."、"打算..."等表达意图的句子
- 只提取明确的行动项，忽略模糊的想法
- 每个待办事项应该是具体、可操作的
- 返回一个JSON数组，每个元素包含待办事项内容和原始文本

日记内容：
${content}

请按以下JSON格式返回结果（不要包含其他内容）：
[
  {
    "task": "待办事项1",
    "originalText": "原始文本1"
  },
  {
    "task": "待办事项2",
    "originalText": "原始文本2"
  }
]

如果没有找到待办事项，请返回空数组 []
      `;
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的任务提取助手，擅长从文本中识别和提取待办事项。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        { headers: this.createHeaders(apiKey) }
      );
      
      // 解析返回的JSON结果
      const assistantMessage = response.data.choices[0].message.content;
      const extractedTasks = JSON.parse(assistantMessage);
      
      // 将提取的任务保存到数据库
      const savedTasks = [];
      for (const item of extractedTasks) {
        const task = await Task.create({
          user: userId,
          journal: journalId,
          content: item.task,
          originalText: item.originalText
        });
        savedTasks.push(task);
      }
      
      return savedTasks;
    } catch (error) {
      console.error('提取待办事项失败:', error);
      throw error;
    }
  }

  // 生成周报
  async generateWeeklyReport(userId, journals, completedTasks) {
    try {
      const apiKey = await this.getUserApiKey(userId);
      
      // 准备周报数据
      const journalContents = journals.map(journal => ({
        date: new Date(journal.date).toLocaleDateString(),
        content: journal.content,
        theme: journal.aiAnalysis?.theme || '无主题',
        sentiment: journal.aiAnalysis?.sentiment || '未分析'
      }));
      
      const taskList = completedTasks.map(task => ({
        content: task.content,
        completedAt: new Date(task.completedAt).toLocaleDateString()
      }));
      
      const prompt = `
请根据以下一周的日记和已完成的任务，生成一份周报总结。
包括以下内容：
1. 本周概述：对一周整体情况的简要总结（100-150字）
2. 主题分析：分析一周日记中出现的主要主题和关注点（150-200字）
3. 情绪趋势：分析一周的情绪变化趋势（100-150字）
4. 成就回顾：总结已完成的任务和取得的成就（100-150字）
5. 成长建议：基于日记内容，提供3-5条有针对性的成长建议（200-300字）

本周日记：
${JSON.stringify(journalContents, null, 2)}

已完成任务：
${JSON.stringify(taskList, null, 2)}

请按以下JSON格式返回结果（不要包含其他内容）：
{
  "weekOverview": "本周概述内容",
  "themeAnalysis": "主题分析内容",
  "moodTrend": "情绪趋势内容",
  "achievements": "成就回顾内容",
  "growthSuggestions": "成长建议内容"
}
      `;
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: '你是一个专业的个人发展顾问，擅长分析日记内容并提供有价值的成长建议。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        },
        { headers: this.createHeaders(apiKey) }
      );
      
      // 解析返回的JSON结果
      const assistantMessage = response.data.choices[0].message.content;
      const reportResult = JSON.parse(assistantMessage);
      
      return reportResult;
    } catch (error) {
      console.error('生成周报失败:', error);
      throw error;
    }
  }
}

module.exports = new DeepSeekService();
