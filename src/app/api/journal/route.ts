import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 创建新日记
export const POST = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '日记内容不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 插入新日记
    const result = await DB
      .prepare(
        'INSERT INTO journals (user_id, content) VALUES (?, ?)'
      )
      .bind(userId, content)
      .run();

    const journalId = result.meta.last_row_id;

    if (!journalId) {
      return NextResponse.json(
        { error: '创建日记失败' },
        { status: 500 }
      );
    }

    // 获取创建的日记
    const journal = await DB
      .prepare('SELECT * FROM journals WHERE id = ?')
      .bind(journalId)
      .first();

    return NextResponse.json({
      success: true,
      message: '日记创建成功',
      journal
    }, { status: 201 });
  } catch (error) {
    console.error('创建日记错误:', error);
    return NextResponse.json(
      { error: '创建日记过程中发生错误' },
      { status: 500 }
    );
  }
});

// 获取用户所有日记
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { DB } = await getDbContext();

    // 获取用户所有日记，按创建时间降序排列
    const journals = await DB
      .prepare('SELECT * FROM journals WHERE user_id = ? ORDER BY created_at DESC')
      .bind(userId)
      .all();

    return NextResponse.json({
      success: true,
      journals: journals.results
    });
  } catch (error) {
    console.error('获取日记列表错误:', error);
    return NextResponse.json(
      { error: '获取日记列表过程中发生错误' },
      { status: 500 }
    );
  }
});
