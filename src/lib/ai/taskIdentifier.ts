import axios from 'axios';

export async function identifyTasks(text) {
  try {
    // 使用正则表达式识别任务
    const taskPatterns = [
      /今天我要(.*?)(?=。|，|；|$)/g,
      /我计划(.*?)(?=。|，|；|$)/g,
      /准备(.*?)(?=。|，|；|$)/g,
      /需要(.*?)(?=。|，|；|$)/g,
      /打算(.*?)(?=。|，|；|$)/g,
      /决定(.*?)(?=。|，|；|$)/g
    ];
    
    let tasks = [];
    
    // 遍历所有模式，提取匹配的任务
    taskPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1].trim().length > 0) {
          tasks.push(match[1].trim());
        }
      }
    });
    
    // 去重
    tasks = [...new Set(tasks)];
    
    return tasks;
  } catch (error) {
    console.error('任务识别失败:', error);
    return [];
  }
}
