import { NextResponse } from 'next/server';
import { executeQueryFirst } from '@/lib/db/index';
import { comparePasswords, generateToken, setAuthCookie } from '@/lib/auth/utils';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // 验证输入
    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码是必填的' }, { status: 400 });
    }
    
    // 查找用户
    const user = await executeQueryFirst(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 401 });
    }
    
    // 验证密码
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: '邮箱或密码不正确' }, { status: 401 });
    }
    
    // 生成令牌
    const token = generateToken(user.id);
    
    // 设置认证cookie
    setAuthCookie(token);
    
    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        email: user.email 
      } 
    });
  } catch (error) {
    console.error('登录错误:', error);
    return NextResponse.json({ error: '登录失败，请稍后再试' }, { status: 500 });
  }
}
