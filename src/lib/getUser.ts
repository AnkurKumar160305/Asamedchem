import { verifyToken, TokenPayload } from './auth';

export function getUserFromRequest(req: Request): TokenPayload | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    return verifyToken(token);
  }
  
  // Try getting from query parameters (useful for exports/downloads)
  try {
    const url = new URL(req.url);
    const tokenParam = url.searchParams.get('token');
    if (tokenParam) {
      return verifyToken(tokenParam);
    }
  } catch (e) {}

  return null;
}

export function isAdmin(user: TokenPayload | null): boolean {
  return user?.role === 'ADMIN';
}
