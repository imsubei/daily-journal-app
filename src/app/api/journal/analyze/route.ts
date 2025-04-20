import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { analyzeJournalContent } from '@/lib/ai/deepseek';
import { NextRequest, NextResponse } from 'next/server';

// 分析日记内容
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

    // 获取用户的API密钥
    const apiKeyRecord = await DB
      .prepare('SELECT deepseek_api_key FROM api_keys WHERE user_id = ?')
      .bind(userId)
      .first();

    if (!apiKeyRecord?.deepseek_api_key) {
      return NextResponse.json(
        { error: '未设置DeepSeek API密钥，请先在设置中配置' },
        { status: 400 }
      );
    }

    // 调用DeepSeek API分析日记内容
    const analysis = await analyzeJournalContent(journal.content, apiKeyRecord.deepseek_api_key);

    // 更新日记的分析结果
    await DB
      .prepare(
        `UPDATE journals 
         SET emotion_label = ?, ai_theme = ?, ai_analysis = ?, ai_thinking_process = ?, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`
      )
      .bind(
        analysis.emotion_label,
        analysis.theme,
        analysis.analysis,
        analysis.thinking_process,
        journalId
      )
      .run();

    // 获取更新后的日记
    const updatedJournal = await DB
      .prepare('SELECT * FROM journals WHERE id = ?')
      .bind(journalId)
      .first();

    return NextResponse.json({
      success: true,
      message: '日记分析成功',
      journal: updatedJournal
    });
  } catch (error) {
    console.error('分析日记错误:', error);
    return NextResponse.json(
      { error: error.message || '分析日记过程中发生错误' },
      { status: 500 }
    );
  }
});
