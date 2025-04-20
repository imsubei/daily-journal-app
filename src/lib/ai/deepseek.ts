import axios from 'axios';

// DeepSeek API调用接口
export async function analyzeJournalContent(content: string, apiKey: string) {
  if (!content || !apiKey) {
    throw new Error('内容和API密钥不能为空');
  }

  try {
    // 构建请求体
    const payload = {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `你是一位专业的心理分析师和文本分析专家。你的任务是分析用户的日记内容，提供以下信息：
1. 情绪标签：识别文本中表达的主要情绪（如愉快、焦虑、积极、中立、悲伤等）
2. 主题归纳：总结文本的核心主旨，用简短的短语表达
3. 深度分析：对内容进行心理学角度的分析，包括情感状态、思考模式等
4. 思考过程：展示你如何得出以上结论的分析过程

请以JSON格式返回结果，包含以下字段：
{
  "emotion_label": "情绪标签",
  "theme": "主题归纳",
  "analysis": "深度分析",
  "thinking_process": "思考过程"
}`
        },
        {
          role: "user",
          content: content
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    // 调用DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // 解析响应
    const aiResponse = response.data.choices[0].message.content;
    
    // 尝试解析JSON响应
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return {
        emotion_label: parsedResponse.emotion_label || '未知',
        theme: parsedResponse.theme || '未能识别主题',
        analysis: parsedResponse.analysis || '未能生成分析',
        thinking_process: parsedResponse.thinking_process || '未提供思考过程'
      };
    } catch (parseError) {
      console.error('解析AI响应时出错:', parseError);
      
      // 如果无法解析JSON，尝试从文本中提取信息
      const emotionMatch = aiResponse.match(/情绪标签[：:]\s*(.+?)[\n\r]/);
      const themeMatch = aiResponse.match(/主题归纳[：:]\s*(.+?)[\n\r]/);
      const analysisMatch = aiResponse.match(/深度分析[：:]\s*([\s\S]+?)(?=思考过程|$)/);
      const thinkingMatch = aiResponse.match(/思考过程[：:]\s*([\s\S]+)$/);
      
      return {
        emotion_label: emotionMatch ? emotionMatch[1].trim() : '未知',
        theme: themeMatch ? themeMatch[1].trim() : '未能识别主题',
        analysis: analysisMatch ? analysisMatch[1].trim() : '未能生成分析',
        thinking_process: thinkingMatch ? thinkingMatch[1].trim() : '未提供思考过程'
      };
    }
  } catch (error) {
    console.error('调用DeepSeek API时出错:', error);
    throw new Error('AI分析失败，请检查API密钥或稍后重试');
  }
}
