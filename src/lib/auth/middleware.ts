import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { parseUserIdFromToken } from '@/lib/auth/utils';
import { getDbContext } from '@/lib/db';

// 中间件类型定义
type MiddlewareHandler = (
  request: NextRequest,
  userId: number
) => Promise<NextResponse>;

// 创建需要认证的API路由处理器
export function withAuth(handler: MiddlewareHandler) {
  return async (request: NextRequest) => {
    try {
      // 获取会话令牌
      const sessionToken = cookies().get('session_token')?.value;

      if (!sessionToken) {
        return NextResponse.json(
          { error: '未授权，请先登录' },
          { status: 401 }
        );
      }

      // 解析用户ID
      const userId = parseUserIdFromToken(sessionToken);
      
      if (!userId) {
        return NextResponse.json(
          { error: '无效的会话，请重新登录' },
          { status: 401 }
        );
      }

      const { DB } = await getDbContext();

      // 验证用户是否存在
      const user = await DB
        .prepare('SELECT id FROM users WHERE id = ?')
        .bind(userId)
        .first();

      if (!user) {
        return NextResponse.json(
          { error: '用户不存在，请重新登录' },
          { status: 401 }
        );
      }

      // 调用实际的处理函数
      return handler(request, userId);
    } catch (error) {
      console.error('认证中间件错误:', error);
      return NextResponse.json(
        { error: '认证过程中发生错误' },
        { status: 500 }
      );
    }
  };
}
