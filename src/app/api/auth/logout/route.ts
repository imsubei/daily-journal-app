import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/auth/utils';

export async function POST() {
  try {
    // 清除认证cookie
    clearAuthCookie();
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('注销错误:', error);
    return NextResponse.json({ error: '注销失败，请稍后再试' }, { status: 500 });
  }
}
