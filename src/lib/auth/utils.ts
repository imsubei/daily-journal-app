import { createHash, randomBytes } from 'crypto';

// 生成随机盐值
export function generateSalt(length: number = 16): string {
  return randomBytes(length).toString('hex');
}

// 使用SHA-256哈希密码
export function hashPassword(password: string, salt: string): string {
  const hash = createHash('sha256');
  hash.update(password + salt);
  return hash.digest('hex');
}

// 验证密码
export function verifyPassword(password: string, salt: string, storedHash: string): boolean {
  const hash = hashPassword(password, salt);
  return hash === storedHash;
}

// 生成会话令牌
export function generateSessionToken(): string {
  return randomBytes(32).toString('hex');
}

// 解析用户ID从会话令牌
export function parseUserIdFromToken(token: string): number | null {
  try {
    // 在实际应用中，这里应该验证令牌的有效性
    // 这里简化处理，假设令牌的前部分是用户ID
    const parts = token.split('.');
    if (parts.length >= 2) {
      return parseInt(parts[0], 10);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// 创建会话令牌
export function createSessionToken(userId: number): string {
  const tokenPart = randomBytes(24).toString('hex');
  return `${userId}.${tokenPart}`;
}
