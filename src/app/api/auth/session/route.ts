import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getDbContext } from '@/lib/db';
import { parseUserIdFromToken } from '@/lib/auth/utils';

export async function GET(request: NextRequest) {
  try {
    // 获取会话令牌
    const sessionToken = cookies().get('session_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // 解析用户ID
    const userId = parseUserIdFromToken(sessionToken);
    
    if (!userId) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const { DB } = await getDbContext();

    // 查找用户
    const user = await DB
      .prepare('SELECT id, username, email FROM users WHERE id = ?')
      .bind(userId)
      .first();

    if (!user) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('会话验证错误:', error);
    return NextResponse.json(
      { authenticated: false, error: '会话验证过程中发生错误' },
      { status: 500 }
    );
  }
}
