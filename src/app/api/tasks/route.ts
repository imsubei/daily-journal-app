import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取用户的所有任务
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { DB } = await getDbContext();

    // 获取用户所有任务，按截止日期和创建时间排序
    const tasks = await DB
      .prepare(`
        SELECT tasks.*, journals.content as journal_content 
        FROM tasks 
        LEFT JOIN journals ON tasks.journal_id = journals.id
        WHERE tasks.user_id = ? 
        ORDER BY 
          tasks.is_completed ASC, 
          CASE WHEN tasks.deadline IS NULL THEN 1 ELSE 0 END,
          tasks.deadline ASC,
          tasks.created_at DESC
      `)
      .bind(userId)
      .all();

    return NextResponse.json({
      success: true,
      tasks: tasks.results
    });
  } catch (error) {
    console.error('获取任务列表错误:', error);
    return NextResponse.json(
      { error: '获取任务列表过程中发生错误' },
      { status: 500 }
    );
  }
});

// 创建新任务
export const POST = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { task_description, deadline, journal_id } = await request.json();

    if (!task_description) {
      return NextResponse.json(
        { error: '任务描述不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 如果提供了journal_id，验证日记所有权
    if (journal_id) {
      const journal = await DB
        .prepare('SELECT id FROM journals WHERE id = ? AND user_id = ?')
        .bind(journal_id, userId)
        .first();

      if (!journal) {
        return NextResponse.json(
          { error: '日记不存在或无权访问' },
          { status: 404 }
        );
      }
    }

    // 创建任务
    const result = await DB
      .prepare(
        'INSERT INTO tasks (user_id, journal_id, task_description, deadline) VALUES (?, ?, ?, ?)'
      )
      .bind(userId, journal_id || null, task_description, deadline || null)
      .run();

    const taskId = result.meta.last_row_id;

    if (!taskId) {
      return NextResponse.json(
        { error: '创建任务失败' },
        { status: 500 }
      );
    }

    // 获取创建的任务
    const task = await DB
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .bind(taskId)
      .first();

    return NextResponse.json({
      success: true,
      message: '任务创建成功',
      task
    }, { status: 201 });
  } catch (error) {
    console.error('创建任务错误:', error);
    return NextResponse.json(
      { error: '创建任务过程中发生错误' },
      { status: 500 }
    );
  }
});
