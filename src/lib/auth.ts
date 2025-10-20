/**
 * Better Auth Configuration
 *
 * This handles authentication to YOUR backend services.
 * This is separate from SMART on FHIR authentication to the EHR.
 */

import { betterAuth } from 'better-auth';
import { nextCookies } from 'better-auth/next-js';
import Database from 'better-sqlite3';
import { env } from '@/env';

// Get database path from environment or use default
const dbPath = env.DATABASE_PATH || './data/auth.db';

// Create database instance
const db = new Database(dbPath);

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  database: {
    // Using SQLite with better-sqlite3
    db,
    type: 'sqlite',
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true in production with email service
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (update session every day)
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // 5 minutes
    },
  },
  user: {
    // Additional user fields for healthcare providers
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'clinician',
        input: false, // Don't allow direct input
      },
      organization: {
        type: 'string',
        required: false,
      },
      npi: {
        type: 'string', // National Provider Identifier for US healthcare providers
        required: false,
        unique: true,
      },
      specialty: {
        type: 'string',
        required: false,
      },
    },
  },
  plugins: [
    nextCookies(), // Enable Next.js cookie handling
  ],
  // Security settings
  advanced: {
    generateId: () => {
      // Generate secure IDs
      return crypto.randomUUID();
    },
    crossSubDomainCookies: {
      enabled: false, // Enable if you need cross-subdomain auth
    },
  },
  // Trust proxy for deployment behind reverse proxy
  trustedOrigins: env.TRUSTED_ORIGINS?.split(',') || [],
});

// Export the auth type for client usage
export type Auth = typeof auth;
