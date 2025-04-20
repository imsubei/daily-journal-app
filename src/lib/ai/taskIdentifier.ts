import { analyzeJournalContent } from './deepseek';

// 任务识别正则表达式模式
const taskPatterns = [
  /今天(?:我)?要(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /计划(?:今天|明天|周[一二三四五六日末]|下周|本周|这周|下个月|本月|这个月)?(?:要)?(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /打算(?:今天|明天|周[一二三四五六日末]|下周|本周|这周|下个月|本月|这个月)?(?:要)?(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /准备(?:今天|明天|周[一二三四五六日末]|下周|本周|这周|下个月|本月|这个月)?(?:要)?(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /需要(?:今天|明天|周[一二三四五六日末]|下周|本周|这周|下个月|本月|这个月)?(?:要)?(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /应该(?:今天|明天|周[一二三四五六日末]|下周|本周|这周|下个月|本月|这个月)?(?:要)?(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /得(?:今天|明天|周[一二三四五六日末]|下周|本周|这周|下个月|本月|这个月)?(?:要)?(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /明天(?:我)?要(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
  /这周(?:我)?要(?:去)?(.+?)(?:。|，|；|！|\n|$)/g,
];

// 时间识别正则表达式模式
const timePatterns = [
  { pattern: /今天/, value: 'today' },
  { pattern: /明天/, value: 'tomorrow' },
  { pattern: /后天/, value: 'day_after_tomorrow' },
  { pattern: /周一|星期一|礼拜一/, value: 'monday' },
  { pattern: /周二|星期二|礼拜二/, value: 'tuesday' },
  { pattern: /周三|星期三|礼拜三/, value: 'wednesday' },
  { pattern: /周四|星期四|礼拜四/, value: 'thursday' },
  { pattern: /周五|星期五|礼拜五/, value: 'friday' },
  { pattern: /周六|星期六|礼拜六/, value: 'saturday' },
  { pattern: /周日|周天|星期日|星期天|礼拜日|礼拜天/, value: 'sunday' },
  { pattern: /下周|下星期|下礼拜/, value: 'next_week' },
  { pattern: /本周|这周|这星期|这礼拜/, value: 'this_week' },
  { pattern: /下个月|下月/, value: 'next_month' },
  { pattern: /本月|这个月/, value: 'this_month' },
];

// 使用正则表达式识别任务
export function extractTasksWithRegex(content: string): Array<{task: string, timeContext: string}> {
  if (!content) return [];
  
  const tasks = [];
  
  // 遍历所有任务模式
  for (const pattern of taskPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1] && match[1].trim()) {
        // 提取任务描述
        const taskDescription = match[1].trim();
        
        // 识别时间上下文
        let timeContext = 'unspecified';
        for (const { pattern, value } of timePatterns) {
          if (pattern.test(match[0])) {
            timeContext = value;
            break;
          }
        }
        
        tasks.push({
          task: taskDescription,
          timeContext
        });
      }
    }
  }
  
  return tasks;
}

// 使用DeepSeek API识别任务
export async function extractTasksWithAI(content: string, apiKey: string): Promise<Array<{task: string, timeContext: string, deadline: string | null}>> {
  if (!content || !apiKey) return [];
  
  try {
    // 构建特定的提示词来识别任务
    const taskPrompt = `
你是一位任务识别专家。请从以下日记内容中识别出用户计划要做的事情。
只关注明确表达了"计划做什么"的内容，例如"今天我要..."、"明天需要..."、"计划本周..."等。
对于每个识别出的任务，请提供以下信息：
1. 任务描述：具体要做的事情
2. 时间上下文：任务计划在什么时间完成（今天、明天、本周、下周等）
3. 截止日期：如果能推断出具体日期，请以YYYY-MM-DD格式提供

请以JSON格式返回结果，格式如下：
{
  "tasks": [
    {
      "description": "任务描述",
      "time_context": "时间上下文",
      "deadline": "YYYY-MM-DD或null"
    }
  ]
}

如果没有识别出任何任务，请返回空数组。

日记内容：
${content}
`;

    // 调用DeepSeek API
    const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
      model: "deepseek-chat",
      messages: [
        {
          role: "user",
          content: taskPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    // 解析响应
    const aiResponse = response.data.choices[0].message.content;
    
    try {
      const parsedResponse = JSON.parse(aiResponse);
      if (Array.isArray(parsedResponse.tasks)) {
        return parsedResponse.tasks.map(task => ({
          task: task.description,
          timeContext: task.time_context,
          deadline: task.deadline
        }));
      }
    } catch (parseError) {
      console.error('解析AI任务识别响应时出错:', parseError);
    }
    
    return [];
  } catch (error) {
    console.error('调用DeepSeek API识别任务时出错:', error);
    return [];
  }
}

// 结合正则表达式和AI的任务识别
export async function identifyTasks(content: string, apiKey: string | null = null): Promise<Array<{task: string, timeContext: string, deadline: string | null}>> {
  // 首先使用正则表达式识别任务
  const regexTasks = extractTasksWithRegex(content);
  
  // 如果有API密钥，尝试使用AI识别
  if (apiKey) {
    try {
      const aiTasks = await extractTasksWithAI(content, apiKey);
      
      // 合并结果，优先使用AI识别的结果
      if (aiTasks.length > 0) {
        return aiTasks;
      }
    } catch (error) {
      console.error('AI任务识别失败，回退到正则表达式识别:', error);
    }
  }
  
  // 如果AI识别失败或没有API密钥，返回正则表达式识别的结果
  return regexTasks.map(task => ({
    ...task,
    deadline: null
  }));
}
