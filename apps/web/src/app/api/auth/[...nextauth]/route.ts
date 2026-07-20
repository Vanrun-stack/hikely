/**
 * NextAuth.js API Route Handler
 * Catches all auth routes: /api/auth/signin, /api/auth/signout, etc.
 */
import { handlers } from '@/lib/auth';

export const { GET, POST } = handlers;
