import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { NextRequest } from 'next/server';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development';

export function signToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export function getUserFromRequest(req: NextRequest | Request): TokenPayload | null {
  let token: string | undefined;

  // 1. Try NextRequest cookies
  if (req instanceof NextRequest) {
    token = req.cookies.get('token')?.value;
  } 
  
  // 2. Try manual cookie parsing from headers (fallback or standard Request)
  if (!token) {
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      // More robust parsing: handle whitespace and multiple cookies correctly
      const tokenMatch = cookieHeader.match(/(^|;)\s*token\s*=\s*([^;]+)/);
      if (tokenMatch) {
        token = tokenMatch[2].trim();
      }
    }
  }

  // 3. Last fallback: Authorization header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) return null;

  return verifyToken(token);
}

export function setTokenCookie(token: string) {
  return serialize('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}
