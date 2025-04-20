import { withAuth } from '@/lib/auth/middleware';
import { getDbContext } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// 获取用户的DeepSeek API密钥
export const GET = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { DB } = await getDbContext();

    // 获取用户的API密钥
    const apiKey = await DB
      .prepare('SELECT deepseek_api_key FROM api_keys WHERE user_id = ?')
      .bind(userId)
      .first();

    return NextResponse.json({
      success: true,
      hasApiKey: !!apiKey?.deepseek_api_key,
      apiKey: apiKey?.deepseek_api_key ? {
        // 只返回部分密钥，保护安全
        masked: `${apiKey.deepseek_api_key.substring(0, 4)}...${apiKey.deepseek_api_key.substring(apiKey.deepseek_api_key.length - 4)}`
      } : null
    });
  } catch (error) {
    console.error('获取API密钥错误:', error);
    return NextResponse.json(
      { error: '获取API密钥过程中发生错误' },
      { status: 500 }
    );
  }
});

// 保存用户的DeepSeek API密钥
export const POST = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API密钥不能为空' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 保存或更新API密钥
    await DB
      .prepare(
        `INSERT INTO api_keys (user_id, deepseek_api_key) 
         VALUES (?, ?)
         ON CONFLICT (user_id) 
         DO UPDATE SET deepseek_api_key = ?, updated_at = CURRENT_TIMESTAMP`
      )
      .bind(userId, apiKey, apiKey)
      .run();

    return NextResponse.json({
      success: true,
      message: 'API密钥保存成功'
    });
  } catch (error) {
    console.error('保存API密钥错误:', error);
    return NextResponse.json(
      { error: '保存API密钥过程中发生错误' },
      { status: 500 }
    );
  }
});

// 删除用户的DeepSeek API密钥
export const DELETE = withAuth(async (request: NextRequest, userId: number) => {
  try {
    const { DB } = await getDbContext();

    // 删除API密钥
    await DB
      .prepare('DELETE FROM api_keys WHERE user_id = ?')
      .bind(userId)
      .run();

    return NextResponse.json({
      success: true,
      message: 'API密钥删除成功'
    });
  } catch (error) {
    console.error('删除API密钥错误:', error);
    return NextResponse.json(
      { error: '删除API密钥过程中发生错误' },
      { status: 500 }
    );
  }
});
