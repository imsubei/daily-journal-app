import axios from 'axios';

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export async function analyzeJournalEntry(text, apiKey) {
  if (!apiKey) {
    throw new Error('DeepSeek API密钥未配置');
  }

  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的日记分析助手，擅长分析文本情绪、提取主题和提供深度思考。'
          },
          {
            role: 'user',
            content: `请分析以下日记内容，并提供以下信息：
            1. 情绪标签（如愉快、焦虑、积极、中立等）
            2. 主题归纳（总结文本核心主旨）
            3. 情感评价（对情感的深度分析）
            4. 思考过程（你是如何分析得出以上结论的）
            
            日记内容：${text}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    const result = response.data.choices[0].message.content;
    
    // 解析结果
    const emotionMatch = result.match(/情绪标签[：:]\s*(.+?)(?=\n|$)/);
    const themeMatch = result.match(/主题归纳[：:]\s*(.+?)(?=\n|$)/);
    const evaluationMatch = result.match(/情感评价[：:]\s*([\s\S]+?)(?=\n\d|思考过程|$)/);
    const thoughtProcessMatch = result.match(/思考过程[：:]\s*([\s\S]+?)(?=$)/);

    return {
      emotion: emotionMatch ? emotionMatch[1].trim() : '未知',
      theme: themeMatch ? themeMatch[1].trim() : '未知',
      evaluation: evaluationMatch ? evaluationMatch[1].trim() : '未知',
      thoughtProcess: thoughtProcessMatch ? thoughtProcessMatch[1].trim() : '未知',
      rawResponse: result
    };
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    throw new Error('分析失败，请稍后再试');
  }
}
