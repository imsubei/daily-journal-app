import { D1Database } from '@cloudflare/workers-types';

declare global {
  var DB: D1Database;
}

export async function getDb() {
  if (typeof global.DB !== 'undefined') {
    return global.DB;
  }
  
  throw new Error('Database connection not available');
}

export async function executeQuery(query: string, params: any[] = []) {
  const db = await getDb();
  return db.prepare(query).bind(...params).run();
}

export async function executeQueryAll(query: string, params: any[] = []) {
  const db = await getDb();
  return db.prepare(query).bind(...params).all();
}

export async function executeQueryFirst(query: string, params: any[] = []) {
  const db = await getDb();
  return db.prepare(query).bind(...params).first();
}
