import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取用户的情绪统计数据
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { DB } = await getDbContext();

    // 获取情绪分布统计
    const emotionStats = await DB
      .prepare(`
        SELECT emotion_label, COUNT(*) as count
        FROM journals
        WHERE user_id = ? AND emotion_label IS NOT NULL
        GROUP BY emotion_label
        ORDER BY count DESC
      `)
      .bind(userId)
      .all();

    // 获取情绪随时间变化的数据
    const emotionTrend = await DB
      .prepare(`
        SELECT 
          DATE(created_at) as date,
          emotion_label
        FROM journals
        WHERE user_id = ? AND emotion_label IS NOT NULL
        ORDER BY created_at ASC
      `)
      .bind(userId)
      .all();

    // 获取主题分布统计
    const themeStats = await DB
      .prepare(`
        SELECT ai_theme, COUNT(*) as count
        FROM journals
        WHERE user_id = ? AND ai_theme IS NOT NULL
        GROUP BY ai_theme
        ORDER BY count DESC
        LIMIT 10
      `)
      .bind(userId)
      .all();

    // 获取任务完成率统计
    const taskStats = await DB
      .prepare(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM tasks
        WHERE user_id = ?
      `)
      .bind(userId)
      .first();

    // 获取每周任务完成率趋势
    const taskCompletionTrend = await DB
      .prepare(`
        SELECT 
          strftime('%Y-%W', created_at) as week,
          COUNT(*) as total,
          SUM(CASE WHEN is_completed = 1 THEN 1 ELSE 0 END) as completed
        FROM tasks
        WHERE user_id = ?
        GROUP BY week
        ORDER BY week ASC
      `)
      .bind(userId)
      .all();

    // 获取日记数量随时间变化的数据
    const journalCountTrend = await DB
      .prepare(`
        SELECT 
          strftime('%Y-%m', created_at) as month,
          COUNT(*) as count
        FROM journals
        WHERE user_id = ?
        GROUP BY month
        ORDER BY month ASC
      `)
      .bind(userId)
      .all();

    return NextResponse.json({
      success: true,
      stats: {
        emotionStats: emotionStats.results,
        emotionTrend: emotionTrend.results,
        themeStats: themeStats.results,
        taskStats: taskStats || { total: 0, completed: 0 },
        taskCompletionTrend: taskCompletionTrend.results,
        journalCountTrend: journalCountTrend.results
      }
    });
  } catch (error) {
    console.error('获取统计数据错误:', error);
    return NextResponse.json(
      { error: '获取统计数据过程中发生错误' },
      { status: 500 }
    );
  }
});
