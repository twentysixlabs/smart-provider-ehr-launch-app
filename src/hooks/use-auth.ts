/**
 * Authentication Hook
 *
 * Provides access to current user session and auth methods
 */

'use client';

import { useRouter } from 'next/navigation';
import { signOut as authSignOut, useSession } from '@/lib/auth-client';
import type { Session, User } from '@/types/auth';

export function useAuth() {
  const router = useRouter();
  const { data: session, isPending, error } = useSession();

  const signOut = async () => {
    await authSignOut();
    router.push('/auth/sign-in');
    router.refresh();
  };

  return {
    user: session?.user as User | null,
    session: session as Session | null,
    isLoading: isPending,
    error,
    signOut,
    isAuthenticated: !!session?.user,
  };
}
