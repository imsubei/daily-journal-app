import { NextResponse } from 'next/server';
import { executeQuery, executeQueryFirst } from '@/lib/db/index';
import { hashPassword } from '@/lib/auth/utils';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();
    
    // 验证输入
    if (!username || !email || !password) {
      return NextResponse.json({ error: '所有字段都是必填的' }, { status: 400 });
    }
    
    // 检查用户名或邮箱是否已存在
    const existingUser = await executeQueryFirst(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );
    
    if (existingUser) {
      return NextResponse.json({ error: '用户名或邮箱已被使用' }, { status: 409 });
    }
    
    // 哈希密码
    const hashedPassword = await hashPassword(password);
    
    // 创建用户
    const result = await executeQuery(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    return NextResponse.json({ success: true, userId: result.meta.last_row_id }, { status: 201 });
  } catch (error) {
    console.error('注册错误:', error);
    return NextResponse.json({ error: '注册失败，请稍后再试' }, { status: 500 });
  }
}
