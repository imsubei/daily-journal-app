import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export function setAuthCookie(token: string) {
  cookies().set({
    name: 'auth_token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export function getAuthCookie() {
  return cookies().get('auth_token')?.value;
}

export function clearAuthCookie() {
  cookies().delete('auth_token');
}

export async function getCurrentUser() {
  const token = getAuthCookie();
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;
  
  return decoded.userId;
}
