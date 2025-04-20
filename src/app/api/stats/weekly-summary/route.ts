import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 生成每周摘要
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { DB } = await getDbContext();

    // 获取最近一周的日期范围
    const now = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekStartDate = oneWeekAgo.toISOString().split('T')[0];
    const weekEndDate = now.toISOString().split('T')[0];

    // 检查是否已经有本周的摘要
    const existingSummary = await DB
      .prepare(`
        SELECT * FROM weekly_summaries
        WHERE user_id = ? AND week_start_date = ?
      `)
      .bind(userId, weekStartDate)
      .first();

    if (existingSummary) {
      return NextResponse.json({
        success: true,
        summary: existingSummary,
        isNew: false
      });
    }

    // 获取本周的情绪统计
    const emotionStats = await DB
      .prepare(`
        SELECT emotion_label, COUNT(*) as count
        FROM journals
        WHERE user_id = ? 
          AND emotion_label IS NOT NULL
          AND DATE(created_at) BETWEEN ? AND ?
        GROUP BY emotion_label
        ORDER BY count DESC
      `)
      .bind(userId, weekStartDate, weekEndDate)
      .all();

    // 获取本周的主题
    const themes = await DB
      .prepare(`
        SELECT ai_theme
        FROM journals
        WHERE user_id = ? 
          AND ai_theme IS NOT NULL
          AND DATE(created_at) BETWEEN ? AND ?
        ORDER BY created_at DESC
      `)
      .bind(userId, weekStartDate, weekEndDate)
      .all();

    // 获取本周的任务完成率
    const taskStats = await DB
      .prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM tasks
        WHERE user_id = ?
          AND DATE(created_at) BETWEEN ? AND ?
      `)
      .bind(userId, weekStartDate, weekEndDate)
      .first();

    // 计算任务完成率
    const taskCompletionRate = taskStats && taskStats.total > 0 
      ? (taskStats.completed / taskStats.total) * 100 
      : 0;

    // 生成摘要内容
    const emotionStatsJson = JSON.stringify(emotionStats.results);
    const themeSummary = themes.results.map(t => t.ai_theme).slice(0, 5).join(', ');
    
    // 生成摘要文本
    let generatedContent = `本周回顾 (${weekStartDate} 至 ${weekEndDate}):\n\n`;
    
    // 情绪部分
    generatedContent += "【情绪概览】\n";
    if (emotionStats.results.length > 0) {
      const mainEmotion = emotionStats.results[0].emotion_label;
      generatedContent += `本周主要情绪: ${mainEmotion}\n`;
      emotionStats.results.forEach(emotion => {
        generatedContent += `- ${emotion.emotion_label}: ${emotion.count} 次\n`;
      });
    } else {
      generatedContent += "本周没有记录情绪\n";
    }
    
    // 主题部分
    generatedContent += "\n【主题回顾】\n";
    if (themes.results.length > 0) {
      generatedContent += `本周关注的主题: ${themeSummary}\n`;
    } else {
      generatedContent += "本周没有记录主题\n";
    }
    
    // 任务部分
    generatedContent += "\n【任务完成情况】\n";
    if (taskStats && taskStats.total > 0) {
      generatedContent += `完成率: ${taskCompletionRate.toFixed(1)}%\n`;
      generatedContent += `- 总任务数: ${taskStats.total}\n`;
      generatedContent += `- 已完成: ${taskStats.completed}\n`;
      generatedContent += `- 未完成: ${taskStats.total - taskStats.completed}\n`;
    } else {
      generatedContent += "本周没有记录任务\n";
    }
    
    // 保存摘要到数据库
    const result = await DB
      .prepare(`
        INSERT INTO weekly_summaries 
        (user_id, week_start_date, week_end_date, emotion_stats, theme_summary, task_completion_rate, generated_content)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `)
      .bind(
        userId, 
        weekStartDate, 
        weekEndDate, 
        emotionStatsJson,
        themeSummary,
        taskCompletionRate,
        generatedContent
      )
      .run();

    const summaryId = result.meta.last_row_id;

    // 获取创建的摘要
    const summary = await DB
      .prepare('SELECT * FROM weekly_summaries WHERE id = ?')
      .bind(summaryId)
      .first();

    return NextResponse.json({
      success: true,
      summary,
      isNew: true
    });
  } catch (error) {
    console.error('生成每周摘要错误:', error);
    return NextResponse.json(
      { error: '生成每周摘要过程中发生错误' },
      { status: 500 }
    );
  }
});
