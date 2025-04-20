import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 导出用户数据
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { DB } = await getDbContext();

    // 获取用户信息
    const user = await DB
      .prepare('SELECT id, username, email, created_at FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }

    // 获取用户的所有日记
    const journals = await DB
      .prepare(`
        SELECT * FROM journals
        WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .bind(userId)
      .all();

    // 获取用户的所有任务
    const tasks = await DB
      .prepare(`
        SELECT * FROM tasks
        WHERE user_id = ?
        ORDER BY created_at DESC
      `)
      .bind(userId)
      .all();

    // 获取用户的所有每周摘要
    const weeklySummaries = await DB
      .prepare(`
        SELECT * FROM weekly_summaries
        WHERE user_id = ?
        ORDER BY week_start_date DESC
      `)
      .bind(userId)
      .all();

    // 构建导出数据
    const exportData = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        created_at: user.created_at
      },
      journals: journals.results,
      tasks: tasks.results,
      weekly_summaries: weeklySummaries.results,
      export_date: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('导出数据错误:', error);
    return NextResponse.json(
      { error: '导出数据过程中发生错误' },
      { status: 500 }
    );
  }
});
