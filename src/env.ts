import { createEnv } from '@t3-oss/env-nextjs';
// import { vercel } from '@t3-oss/env-nextjs/presets';
import { z } from 'zod';

export const env = createEnv({
  shared: {
    VERCEL_URL: z
      .string()
      .optional()
      .transform((v) => (v ? `https://${v}` : undefined)),
    VERCEL_ENV: z.enum(['development', 'production', 'test', 'preview']).default('development'),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.coerce.number().default(3000),
    STAGING: z.boolean().default(false),
  },
  /**
   * Specify your client-side environment variables schema here.
   * For them to be exposed to the client, prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    // Site
    NEXT_PUBLIC_APP_URL: z.string().optional().default('http://localhost:3000'),
  },
  server: {
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    MICROSOFT_CLIENT_ID: z.string().optional(),
    MICROSOFT_CLIENT_SECRET: z.string().optional(),
    BETTER_AUTH_SECRET: z.string().optional().default('development-secret-change-in-production'),
    DATABASE_PATH: z.string().optional().default('./data/auth.db'),
    TRUSTED_ORIGINS: z.string().optional().default('http://localhost:3000'),
    ADMIN_EMAIL: z.string().optional().default('admin@example.com'),
    ADMIN_PASSWORD: z.string().optional().default('password'),
    ADMIN_NAME: z.string().optional().default('Admin'),
  },
  experimental__runtimeEnv: {
    VERCEL_URL: process.env.VERCEL_URL,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    STAGING: process.env.STAGING,

    // client-side environment variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
  skipValidation: !!process.env.CI || process.env.npm_lifecycle_event === 'lint',
  onInvalidAccess(variable) {
    // biome-ignore lint/suspicious/noConsole: ignore
    console.error('This is the invalid access error', variable);
    throw variable;
  },
  onValidationError(error) {
    // biome-ignore lint/suspicious/noConsole: ignore
    console.error('This is the validation error', error);
    throw error;
  },
});

// Determine environment mode
export enum EnvMode {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export const ENV_MODE = (() => {
  if (env.NODE_ENV === 'production') {
    return process.env.STAGING === 'true' ? EnvMode.STAGING : EnvMode.PRODUCTION;
  }
  return EnvMode.DEVELOPMENT;
})();

/**
 * Environment utility functions for consistent environment detection across the application
 */

/**
 * Is the application running in production mode
 */
export const isProd = env.NODE_ENV === 'production';

/**
 * Is the application running in development mode
 */
export const isDev = env.NODE_ENV === 'development';

/**
 * Is the application running in test mode
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Is this the hosted version of the application
 */
export const isHosted = env.NEXT_PUBLIC_APP_URL === 'https://www.healthnotes.ai';
