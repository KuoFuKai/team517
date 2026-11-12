import { getAuth } from 'firebase-admin/auth';
import { ApiFailure } from '../shared/errors';
export async function authenticate(header?: string): Promise<string> {
  const match = /^Bearer (\S+)$/.exec(header ?? '');
  if (!match) throw new ApiFailure(401,'UNAUTHENTICATED','A Firebase ID token is required.');
  try { return (await getAuth().verifyIdToken(match[1],true)).uid; }
  catch { throw new ApiFailure(401,'UNAUTHENTICATED','Invalid or expired token.'); }
}
