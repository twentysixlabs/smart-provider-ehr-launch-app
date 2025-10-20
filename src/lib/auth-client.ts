/**
 * Better Auth Client Configuration
 *
 * Client-side authentication utilities
 */

import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
});

// Export commonly used auth methods
export const { signIn, signUp, signOut, useSession } = authClient;
