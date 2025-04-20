import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/utils';
import { executeQueryFirst } from '@/lib/db/index';

export async function GET() {
  try {
    const userId = await getCurrentUser();
    
    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }
    
    const user = await executeQueryFirst(
      'SELECT id, username, email FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      return NextResponse.json({ authenticated: false });
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
    console.error('会话检查错误:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
