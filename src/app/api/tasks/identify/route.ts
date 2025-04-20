import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { identifyTasks } from '@/lib/ai/taskIdentifier';
import { NextRequest, NextResponse } from 'next/server';

// 从日记中识别任务
export const POST = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { journalId } = await request.json();

    if (!journalId) {
      return NextResponse.json(
        { error: '日记ID不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 获取日记内容
    const journal = await DB
      .prepare('SELECT * FROM journals WHERE id = ? AND user_id = ?')
      .bind(journalId, userId)
      .first();

    if (!journal) {
      return NextResponse.json(
        { error: '日记不存在或无权访问' },
        { status: 404 }
      );
    }

    // 获取用户的API密钥（如果有）
    const apiKeyRecord = await DB
      .prepare('SELECT deepseek_api_key FROM api_keys WHERE user_id = ?')
      .bind(userId)
      .first();

    const apiKey = apiKeyRecord?.deepseek_api_key || null;

    // 识别任务
    const tasks = await identifyTasks(journal.content, apiKey);

    if (tasks.length === 0) {
      return NextResponse.json({
        success: true,
        message: '未识别到任务',
        tasks: []
      });
    }

    // 保存识别到的任务
    const savedTasks = [];
    for (const task of tasks) {
      // 计算截止日期
      let deadline = null;
      if (task.deadline) {
        deadline = task.deadline;
      } else {
        // 根据时间上下文设置默认截止日期
        const now = new Date();
        switch (task.timeContext) {
          case 'today':
            deadline = now.toISOString().split('T')[0];
            break;
          case 'tomorrow':
            now.setDate(now.getDate() + 1);
            deadline = now.toISOString().split('T')[0];
            break;
          case 'day_after_tomorrow':
            now.setDate(now.getDate() + 2);
            deadline = now.toISOString().split('T')[0];
            break;
          case 'this_week':
            // 设置为本周五
            const dayOfWeek = now.getDay();
            const daysToFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 5 + 7 - dayOfWeek;
            now.setDate(now.getDate() + daysToFriday);
            deadline = now.toISOString().split('T')[0];
            break;
          case 'next_week':
            // 设置为下周五
            now.setDate(now.getDate() + 7);
            const nextDayOfWeek = now.getDay();
            const nextDaysToFriday = nextDayOfWeek <= 5 ? 5 - nextDayOfWeek : 5 + 7 - nextDayOfWeek;
            now.setDate(now.getDate() + nextDaysToFriday);
            deadline = now.toISOString().split('T')[0];
            break;
          // 其他情况保持为null
        }
      }

      // 插入任务
      const result = await DB
        .prepare(
          `INSERT INTO tasks (user_id, journal_id, task_description, deadline) 
           VALUES (?, ?, ?, ?)`
        )
        .bind(userId, journalId, task.task, deadline)
        .run();

      if (result.meta.last_row_id) {
        const savedTask = await DB
          .prepare('SELECT * FROM tasks WHERE id = ?')
          .bind(result.meta.last_row_id)
          .first();
        
        savedTasks.push(savedTask);
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功识别并保存了 ${savedTasks.length} 个任务`,
      tasks: savedTasks
    });
  } catch (error) {
    console.error('识别任务错误:', error);
    return NextResponse.json(
      { error: error.message || '识别任务过程中发生错误' },
      { status: 500 }
    );
  }
});
