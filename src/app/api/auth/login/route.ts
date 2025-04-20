import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getDbContext } from '@/lib/db';
import { createSessionToken, verifyPassword } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: '邮箱和密码都是必填项' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 查找用户
    const user = await DB
      .prepare('SELECT id, username, email, password_hash FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (!user) {
      return NextResponse.json(
        { error: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 验证密码
    const [salt, storedHash] = user.password_hash.split(':');
    if (!verifyPassword(password, salt, storedHash)) {
      return NextResponse.json(
        { error: '邮箱或密码不正确' },
        { status: 401 }
      );
    }

    // 创建会话令牌
    const sessionToken = createSessionToken(user.id);

    // 设置Cookie
    cookies().set({
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天
    });

    return NextResponse.json({
      success: true,
      message: '登录成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json(
      { error: '登录过程中发生错误' },
      { status: 500 }
    );
  }
}
