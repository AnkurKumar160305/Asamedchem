import { verifyToken, TokenPayload } from './auth';

export function getUserFromRequest(req: Request): TokenPayload | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  return verifyToken(token);
}

export function isAdmin(user: TokenPayload | null): boolean {
  return user?.role === 'ADMIN';
}
