import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/utils';

export async function middleware(request: NextRequest) {
  // 公开路径，不需要认证
  const publicPaths = ['/login', '/register', '/'];
  const path = request.nextUrl.pathname;
  
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }
  
  // 检查用户是否已认证
  const userId = await getCurrentUser();
  
  if (!userId) {
    // 用户未认证，重定向到登录页面
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // 用户已认证，继续请求
  return NextResponse.next();
}
