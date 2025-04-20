import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取单个任务
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const taskId = request.url.split('/').pop();
    
    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 获取任务并验证所有权
    const task = await DB
      .prepare(`
        SELECT tasks.*, journals.content as journal_content 
        FROM tasks 
        LEFT JOIN journals ON tasks.journal_id = journals.id
        WHERE tasks.id = ? AND tasks.user_id = ?
      `)
      .bind(taskId, userId)
      .first();

    if (!task) {
      return NextResponse.json(
        { error: '任务不存在或无权访问' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      task
    });
  } catch (error) {
    console.error('获取任务详情错误:', error);
    return NextResponse.json(
      { error: '获取任务详情过程中发生错误' },
      { status: 500 }
    );
  }
});

// 更新任务
export const PUT = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const taskId = request.url.split('/').pop();
    
    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      );
    }

    const { task_description, deadline, is_completed } = await request.json();

    const { DB } = await getDbContext();

    // 验证任务所有权
    const existingTask = await DB
      .prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?')
      .bind(taskId, userId)
      .first();

    if (!existingTask) {
      return NextResponse.json(
        { error: '任务不存在或无权修改' },
        { status: 404 }
      );
    }

    // 更新任务
    await DB
      .prepare(
        `UPDATE tasks 
         SET 
           task_description = COALESCE(?, task_description),
           deadline = ?,
           is_completed = COALESCE(?, is_completed),
           updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`
      )
      .bind(
        task_description || null,
        deadline,
        is_completed !== undefined ? is_completed ? 1 : 0 : null,
        taskId
      )
      .run();

    // 获取更新后的任务
    const task = await DB
      .prepare('SELECT * FROM tasks WHERE id = ?')
      .bind(taskId)
      .first();

    return NextResponse.json({
      success: true,
      message: '任务更新成功',
      task
    });
  } catch (error) {
    console.error('更新任务错误:', error);
    return NextResponse.json(
      { error: '更新任务过程中发生错误' },
      { status: 500 }
    );
  }
});

// 删除任务
export const DELETE = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const taskId = request.url.split('/').pop();
    
    if (!taskId) {
      return NextResponse.json(
        { error: '任务ID不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 验证任务所有权
    const existingTask = await DB
      .prepare('SELECT id FROM tasks WHERE id = ? AND user_id = ?')
      .bind(taskId, userId)
      .first();

    if (!existingTask) {
      return NextResponse.json(
        { error: '任务不存在或无权删除' },
        { status: 404 }
      );
    }

    // 删除任务
    await DB
      .prepare('DELETE FROM tasks WHERE id = ?')
      .bind(taskId)
      .run();

    return NextResponse.json({
      success: true,
      message: '任务删除成功'
    });
  } catch (error) {
    console.error('删除任务错误:', error);
    return NextResponse.json(
      { error: '删除任务过程中发生错误' },
      { status: 500 }
    );
  }
});
