/**
 * Authentication Hook
 *
 * Provides access to current user session and auth methods
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  image?: string | null;
}

interface Session {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: User;
}

export function useAuth() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchSession = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (mounted) {
            setSession(null);
            setError(null);
          }
          return;
        }

        const data = await response.json();
        if (mounted) {
          setSession(data);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch session'));
          setSession(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signOut = async () => {
    try {
      await authClient.signOut();
      setSession(null);
      router.push('/auth/sign-in');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'));
    }
  };

  return {
    user: session?.user ?? null,
    session: session ?? null,
    isLoading,
    error,
    signOut,
    isAuthenticated: !!session?.user,
  };
}
