import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getDbContext } from '@/lib/db';
import { createSessionToken, generateSalt, hashPassword } from '@/lib/auth/utils';

export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: '用户名、邮箱和密码都是必填项' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码长度至少为6个字符' },
        { status: 400 }
      );
    }

    const { DB } = await getDbContext();

    // 检查用户名是否已存在
    const existingUsername = await DB
      .prepare('SELECT id FROM users WHERE username = ?')
      .bind(username)
      .first();

    if (existingUsername) {
      return NextResponse.json(
        { error: '用户名已被使用' },
        { status: 409 }
      );
    }

    // 检查邮箱是否已存在
    const existingEmail = await DB
      .prepare('SELECT id FROM users WHERE email = ?')
      .bind(email)
      .first();

    if (existingEmail) {
      return NextResponse.json(
        { error: '邮箱已被注册' },
        { status: 409 }
      );
    }

    // 生成盐值并哈希密码
    const salt = generateSalt();
    const passwordHash = hashPassword(password, salt);
    const combinedHash = `${salt}:${passwordHash}`;

    // 创建用户
    const result = await DB
      .prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
      .bind(username, email, combinedHash)
      .run();

    const userId = result.meta.last_row_id;

    if (!userId) {
      return NextResponse.json(
        { error: '用户创建失败' },
        { status: 500 }
      );
    }

    // 创建会话令牌
    const sessionToken = createSessionToken(userId);

    // 设置Cookie
    cookies().set({
      name: 'session_token',
      value: sessionToken,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天
    });

    return NextResponse.json(
      { 
        success: true, 
        message: '注册成功',
        user: { id: userId, username, email }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json(
      { error: '注册过程中发生错误' },
      { status: 500 }
    );
  }
}
