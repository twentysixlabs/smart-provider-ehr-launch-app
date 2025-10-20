/**
 * Authentication Hook
 *
 * Provides access to current user session and auth methods
 */

'use client';

import { useRouter } from 'next/navigation';
import { signOut as authSignOut, useSession } from '@/lib/auth-client';

export function useAuth() {
  const router = useRouter();
  const session = useSession();

  const signOut = async () => {
    await authSignOut();
    router.push('/auth/sign-in');
    router.refresh();
  };

  return {
    user: session.data?.user ?? null,
    session: session.data ?? null,
    isLoading: session.isPending,
    error: session.error ?? null,
    signOut,
    isAuthenticated: !!session.data?.user,
  };
}
