/**
 * Better Auth Client Configuration
 * 
 * Client-side authentication utilities
 */

import { createAuthClient } from 'better-auth/client';
import type { Auth } from './auth';
import { env } from '@/env';

export const authClient = createAuthClient<Auth>({
  baseURL: env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// Export commonly used auth methods
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
