# Better Auth Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
bun install
```

This will install:
- `better-auth` - Authentication library
- `@better-auth/client` - Client utilities
- `better-sqlite3` - SQLite database
- `arctic` - OAuth providers (if needed)

### 2. Set Up Environment

```bash
# Copy example env file
cp .env.example .env.local

# Generate a secret
openssl rand -base64 32

# Add to .env.local
echo "BETTER_AUTH_SECRET=<your-generated-secret>" >> .env.local
```

### 3. Create Database Directory

```bash
mkdir -p data
```

Better Auth will automatically create the database and tables on first run.

### 4. Start the Application

```bash
bun dev
```

Visit `http://localhost:3000/auth/sign-up` to create your first account.

## Database Schema

Better Auth creates these tables automatically:

```sql
-- Users
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  emailVerified INTEGER DEFAULT 0,
  name TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,
  -- Custom healthcare fields
  role TEXT,
  organization TEXT,
  npi TEXT UNIQUE,
  specialty TEXT
);

-- Passwords
CREATE TABLE password (
  userId TEXT PRIMARY KEY,
  hashedPassword TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES user(id)
);

-- Sessions
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES user(id)
);

-- Verification tokens
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL
);
```

## Authentication Flow

### Sign Up

1. User visits `/auth/sign-up`
2. Fills out form with:
   - Name
   - Email
   - Password
   - Organization (optional)
   - Specialty (optional)
   - NPI (optional)
3. Account created
4. Redirected to dashboard

### Sign In

1. User visits `/auth/sign-in`
2. Enters email and password
3. Session created (7 days)
4. Redirected to last page or dashboard

### Session Management

- Sessions last 7 days by default
- Auto-refresh if user is active
- HTTP-only cookies for security
- CSRF protection enabled

## API Endpoints

### POST /api/auth/sign-up

Create a new user account.

**Request:**
```json
{
  "name": "Dr. Jane Smith",
  "email": "jane@hospital.com",
  "password": "SecurePassword123",
  "organization": "Memorial Hospital",
  "specialty": "Cardiology",
  "npi": "1234567890"
}
```

**Response:**
```json
{
  "user": {
    "id": "user-id",
    "email": "jane@hospital.com",
    "name": "Dr. Jane Smith",
    "role": "clinician"
  },
  "session": {
    "token": "session-token",
    "expiresAt": "2024-01-20T00:00:00Z"
  }
}
```

### POST /api/auth/sign-in

Sign in existing user.

**Request:**
```json
{
  "email": "jane@hospital.com",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "user": { ... },
  "session": { ... }
}
```

### POST /api/auth/sign-out

Sign out current user.

**Response:**
```json
{
  "success": true
}
```

### GET /api/auth/session

Get current session.

**Response:**
```json
{
  "user": { ... },
  "session": { ... }
}
```

## Using Authentication in Components

### Client Components

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';

export function MyComponent() {
  const { user, session, isLoading, signOut } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Organization: {user.organization}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Server Components

```typescript
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export default async function ServerPage() {
  const session = await auth.api.getSession({
    headers: headers(),
  });

  if (!session) {
    redirect('/auth/sign-in');
  }

  return <div>Welcome, {session.user.name}</div>;
}
```

## Middleware Protection

Routes are automatically protected by middleware:

```typescript
// Protected routes (require auth)
const protectedRoutes = [
  '/patient',
  '/dashboard',
  '/settings',
];

// Public routes
const publicRoutes = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/smart/login',  // SMART launch doesn't require Better Auth
];
```

## Customizing User Fields

Edit `src/lib/auth.ts` to add more user fields:

```typescript
export const auth = betterAuth({
  // ...
  user: {
    additionalFields: {
      role: {
        type: 'string',
        defaultValue: 'clinician',
      },
      department: {
        type: 'string',
        required: false,
      },
      licenseNumber: {
        type: 'string',
        required: false,
      },
      // Add more fields as needed
    },
  },
});
```

## Security Best Practices

### Production Checklist

- [ ] Set strong `BETTER_AUTH_SECRET` (use `openssl rand -base64 32`)
- [ ] Enable HTTPS only (`secure` cookies)
- [ ] Configure CORS properly
- [ ] Enable rate limiting at edge/proxy
- [ ] Set up email verification
- [ ] Configure password requirements
- [ ] Enable 2FA (if needed)
- [ ] Set up audit logging
- [ ] Regular security updates

### Password Requirements

Current configuration:
- Minimum 8 characters
- No complexity requirements (configure if needed)

To add complexity:
```typescript
// src/lib/auth.ts
emailAndPassword: {
  enabled: true,
  password: {
    minLength: 12,
    requireNumbers: true,
    requireSymbols: true,
    requireUppercase: true,
  },
}
```

## Email Verification

To enable email verification:

### 1. Configure SMTP

```bash
# .env.local
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### 2. Update Auth Config

```typescript
// src/lib/auth.ts
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  sendVerificationEmail: async ({ user, url }) => {
    // Send email with verification link
    await sendEmail({
      to: user.email,
      subject: 'Verify your email',
      html: `Click here to verify: <a href="${url}">${url}</a>`,
    });
  },
}
```

## Role-Based Access Control

### Define Roles

```typescript
// src/types/auth.ts
export type UserRole = 'clinician' | 'admin' | 'staff' | 'viewer';
```

### Check Roles in Components

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';

export function AdminPanel() {
  const { user } = useAuth();

  if (user?.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return <div>Admin panel</div>;
}
```

### Check Roles in Middleware

```typescript
// src/middleware.ts
if (requiresAdmin && session.user.role !== 'admin') {
  return NextResponse.redirect(new URL('/unauthorized', request.url));
}
```

## Creating Admin Users

Use the script to create an admin user:

```bash
ADMIN_EMAIL=admin@hospital.com \
ADMIN_PASSWORD=SecureAdminPass123 \
ADMIN_NAME="Admin User" \
bun run src/scripts/create-admin.ts
```

## Testing

### Manual Testing

```bash
# Start the app
bun dev

# Test sign up
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Test sign in
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Automated Testing

```typescript
// __tests__/auth.test.ts
import { signUp, signIn } from '@/lib/auth-client';

describe('Authentication', () => {
  it('should sign up a new user', async () => {
    const result = await signUp.email({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
    });

    expect(result.user).toBeDefined();
    expect(result.session).toBeDefined();
  });
});
```

## Troubleshooting

### "Database locked" Error

SQLite can have locking issues with concurrent access. Solutions:
1. Use WAL mode (enabled by default)
2. For production, consider PostgreSQL
3. Check file permissions on `data/auth.db`

### Sessions Not Persisting

1. Check cookie settings in browser
2. Verify HTTPS in production
3. Check `SameSite` cookie attribute
4. Verify `secure` flag is set correctly

### Sign In Fails

1. Check password is correct
2. Verify email exists in database
3. Check console for errors
4. Verify database connection

## Production Deployment

### Vercel

1. Add environment variables in Vercel dashboard
2. Database will be created in `/tmp` (ephemeral)
3. For persistent storage, use:
   - Vercel Postgres
   - External PostgreSQL
   - Supabase

### Cloudflare

1. Add environment variables
2. Use D1 (Cloudflare's SQLite)
3. Update auth config for D1

### Traditional Server

1. Set environment variables
2. Ensure `data/` directory exists and is writable
3. Set proper file permissions
4. Consider backing up database regularly

## Database Migration

### To PostgreSQL

```typescript
// src/lib/auth.ts
import { Pool } from 'pg';
import { env } from '@/env';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const auth = betterAuth({
  database: {
    provider: 'pg',
    client: pool,
  },
  // ...
});
```

### To MySQL

```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});

export const auth = betterAuth({
  database: {
    provider: 'mysql',
    client: pool,
  },
  // ...
});
```

## Resources

- [Better Auth Docs](https://www.better-auth.com/)
- [Better Auth GitHub](https://github.com/better-auth/better-auth)
- [Better Auth Examples](https://www.better-auth.com/docs/examples)

## Support

For issues with Better Auth integration:
1. Check [Better Auth docs](https://www.better-auth.com/)
2. Review [GitHub issues](https://github.com/better-auth/better-auth/issues)
3. Check application logs
4. Verify environment variables

---

**Your backend authentication is now fully configured and ready for production!** 🔐
