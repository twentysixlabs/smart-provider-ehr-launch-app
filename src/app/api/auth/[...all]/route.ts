/**
 * Better Auth API Routes
 * 
 * Handles all authentication endpoints:
 * - POST /api/auth/sign-up - Register new user
 * - POST /api/auth/sign-in - Sign in user
 * - POST /api/auth/sign-out - Sign out user
 * - GET /api/auth/session - Get current session
 */

import { auth } from '@/lib/auth';
import { toNextJsHandler } from 'better-auth/next-js';

export const { GET, POST } = toNextJsHandler(auth);
