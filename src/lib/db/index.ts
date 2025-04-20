import { getCloudflareContext } from '@cloudflare/next';

export interface DbContext {
  DB: D1Database;
}

export async function getDbContext(): Promise<DbContext> {
  const { env } = getCloudflareContext();
  return { DB: env.DB };
}

// 用户相关数据库操作
export async function createUser(
  db: D1Database,
  username: string,
  email: string,
  passwordHash: string
): Promise<number> {
  const result = await db
    .prepare(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)'
    )
    .bind(username, email, passwordHash)
    .run();
  
  return result.meta.last_row_id || 0;
}

export async function getUserByEmail(
  db: D1Database,
  email: string
): Promise<any | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE email = ?')
    .bind(email)
    .first();
  
  return result || null;
}

export async function getUserByUsername(
  db: D1Database,
  username: string
): Promise<any | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE username = ?')
    .bind(username)
    .first();
  
  return result || null;
}

export async function getUserById(
  db: D1Database,
  id: number
): Promise<any | null> {
  const result = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(id)
    .first();
  
  return result || null;
}

// API密钥相关操作
export async function saveApiKey(
  db: D1Database,
  userId: number,
  deepseekApiKey: string
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO api_keys (user_id, deepseek_api_key) 
       VALUES (?, ?)
       ON CONFLICT (user_id) 
       DO UPDATE SET deepseek_api_key = ?, updated_at = CURRENT_TIMESTAMP`
    )
    .bind(userId, deepseekApiKey, deepseekApiKey)
    .run();
}

export async function getApiKey(
  db: D1Database,
  userId: number
): Promise<string | null> {
  const result = await db
    .prepare('SELECT deepseek_api_key FROM api_keys WHERE user_id = ?')
    .bind(userId)
    .first();
  
  return result ? result.deepseek_api_key : null;
}
