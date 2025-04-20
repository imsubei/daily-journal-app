import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取单个日记
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const journalId = request.url.split('/').pop();
    
    if (!journalId) {
      return NextResponse.json(
        { error: '日记ID不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 获取日记并验证所有权
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

    return NextResponse.json({
      success: true,
      journal
    });
  } catch (error) {
    console.error('获取日记详情错误:', error);
    return NextResponse.json(
      { error: '获取日记详情过程中发生错误' },
      { status: 500 }
    );
  }
});

// 更新日记
export const PUT = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const journalId = request.url.split('/').pop();
    
    if (!journalId) {
      return NextResponse.json(
        { error: '日记ID不能为空' },
        { status: 400 }
      );
    }

    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: '日记内容不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 验证日记所有权
    const existingJournal = await DB
      .prepare('SELECT id FROM journals WHERE id = ? AND user_id = ?')
      .bind(journalId, userId)
      .first();

    if (!existingJournal) {
      return NextResponse.json(
        { error: '日记不存在或无权修改' },
        { status: 404 }
      );
    }

    // 更新日记
    await DB
      .prepare(
        'UPDATE journals SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
      )
      .bind(content, journalId)
      .run();

    // 获取更新后的日记
    const journal = await DB
      .prepare('SELECT * FROM journals WHERE id = ?')
      .bind(journalId)
      .first();

    return NextResponse.json({
      success: true,
      message: '日记更新成功',
      journal
    });
  } catch (error) {
    console.error('更新日记错误:', error);
    return NextResponse.json(
      { error: '更新日记过程中发生错误' },
      { status: 500 }
    );
  }
});

// 删除日记
export const DELETE = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const journalId = request.url.split('/').pop();
    
    if (!journalId) {
      return NextResponse.json(
        { error: '日记ID不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 验证日记所有权
    const existingJournal = await DB
      .prepare('SELECT id FROM journals WHERE id = ? AND user_id = ?')
      .bind(journalId, userId)
      .first();

    if (!existingJournal) {
      return NextResponse.json(
        { error: '日记不存在或无权删除' },
        { status: 404 }
      );
    }

    // 删除日记
    await DB
      .prepare('DELETE FROM journals WHERE id = ?')
      .bind(journalId)
      .run();

    return NextResponse.json({
      success: true,
      message: '日记删除成功'
    });
  } catch (error) {
    console.error('删除日记错误:', error);
    return NextResponse.json(
      { error: '删除日记过程中发生错误' },
      { status: 500 }
    );
  }
});
