import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

interface TokenPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const refreshExpire = process.env.REFRESH_TOKEN_EXPIRE || '30d';
  return jwt.sign(payload, JWT_SECRET, { expiresIn: refreshExpire });
};

export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

export const extractTokenFromRequest = (req: NextRequest): string | null => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

export const authenticateRequest = (req: NextRequest): TokenPayload | null => {
  const token = extractTokenFromRequest(req);
  if (!token) {
    return null;
  }
  return verifyToken(token);
};
