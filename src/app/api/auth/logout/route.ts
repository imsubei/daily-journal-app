import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // 清除会话Cookie
    cookies().set({
      name: 'session_token',
      value: '',
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 0, // 立即过期
    });

    return NextResponse.json({
      success: true,
      message: '已成功退出登录'
    });
  } catch (error) {
    console.error('退出登录错误:', error);
    return NextResponse.json(
      { error: '退出登录过程中发生错误' },
      { status: 500 }
    );
  }
}
