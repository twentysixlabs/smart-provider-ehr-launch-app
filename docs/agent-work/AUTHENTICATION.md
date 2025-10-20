# Authentication Architecture

This application implements **dual authentication** - one for your backend services and another for EHR access.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Application                        │
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐        │
│  │  Better Auth     │         │  SMART on FHIR   │        │
│  │  (Your Backend)  │         │  (EHR Access)    │        │
│  │                  │         │                  │        │
│  │  • User login    │         │  • Patient data  │        │
│  │  • Session mgmt  │         │  • EHR launch    │        │
│  │  • Permissions   │         │  • OAuth PKCE    │        │
│  └──────────────────┘         └──────────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Two Authentication Layers

### 1. Better Auth (Your Backend)

**Purpose**: Authenticate clinicians to YOUR application and backend services.

**Features**:
- User registration and login
- Session management
- Role-based access control
- Healthcare provider profiles (NPI, specialty, organization)
- Secure password hashing
- Session persistence

**Flow**:
```
1. Clinician visits your app
2. Signs in with email/password
3. Session created with better-auth
4. Access to your dashboard and features
```

**Endpoints**:
- `POST /api/auth/sign-up` - Register new user
- `POST /api/auth/sign-in` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `GET /api/auth/session` - Get current session

### 2. SMART on FHIR (EHR Access)

**Purpose**: Authenticate with Epic/Cerner/Athena to access patient data from the EHR.

**Features**:
- OAuth 2.0 with PKCE
- EHR launch integration
- Patient context
- Token refresh
- FHIR API access

**Flow**:
```
1. Clinician clicks your app in EHR
2. EHR launches with iss + launch params
3. OAuth flow with PKCE
4. Access to patient FHIR data
```

**Endpoints**:
- `GET /auth/smart/login` - Initiate SMART launch
- `GET /auth/smart/callback` - OAuth callback

## How They Work Together

### Typical User Journey

```
1. First Time Setup:
   ┌──────────────────────────────────┐
   │ 1. Clinician registers account   │ ← Better Auth
   │    (name, email, password, NPI)  │
   └──────────────────────────────────┘
   
2. Daily Usage:
   ┌──────────────────────────────────┐
   │ 1. Sign in to your app           │ ← Better Auth
   │ 2. Click app in EHR              │
   │ 3. SMART launch flow             │ ← SMART on FHIR
   │ 4. Access patient data           │
   └──────────────────────────────────┘
```

### Authentication State

The application maintains **two separate auth states**:

```typescript
// Your backend auth (Better Auth)
const { user, session } = useAuth();

// EHR auth (SMART on FHIR)
const token = useTokenStore((state) => state.token);
const fhirBaseUrl = storage.getItem('fhir-base-url');
```

## Implementation Details

### Better Auth Setup

**Database**: SQLite (better-sqlite3)
```typescript
// src/lib/auth.ts
export const auth = betterAuth({
  database: {
    db: new Database('./data/auth.db'),
    type: 'sqlite',
  },
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: 'string',
      organization: 'string',
      npi: 'string',
      specialty: 'string',
    },
  },
});
```

**Client Usage**:
```typescript
// Sign in
await signIn.email({
  email: 'provider@hospital.com',
  password: 'secure-password',
});

// Get session
const { user, session } = useAuth();

// Sign out
await signOut();
```

### SMART on FHIR Setup

**Configuration**: src/config/config.json
```json
{
  "CLIENT_ID": "your-ehr-client-id",
  "BASE_URL": "https://your-app.com",
  "SMART_SCOPES": ["launch", "patient/*.rs", "user/*.rs"]
}
```

**Usage**:
```typescript
// Get SMART token
const token = useTokenStore((state) => state.token);

// Make FHIR request
const { data: patient } = usePatientQuery(fhirBaseUrl, token);
```

## Middleware Protection

Routes are protected based on authentication requirements:

```typescript
// src/middleware.ts
const protectedRoutes = [
  '/patient',      // Requires Better Auth
  '/dashboard',    // Requires Better Auth
];

const publicRoutes = [
  '/auth/sign-in',        // Public
  '/auth/sign-up',        // Public
  '/auth/smart/login',    // SMART launch (no Better Auth required)
  '/auth/smart/callback', // SMART callback
];
```

## User Schema

### Better Auth User

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  createdAt: Date;
  
  // Healthcare provider fields
  role?: 'clinician' | 'admin' | 'staff';
  organization?: string;
  npi?: string;           // National Provider Identifier
  specialty?: string;     // e.g., "Cardiology"
}
```

### SMART Token Data

```typescript
interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  patient?: string;       // Current patient ID
  encounter?: string;     // Current encounter ID
  scope?: string;
}
```

## Security Considerations

### Better Auth Security

✅ **Password Hashing**: Automatic secure hashing
✅ **Session Tokens**: HTTP-only cookies
✅ **CSRF Protection**: Built-in CSRF tokens
✅ **Rate Limiting**: Implement at edge/proxy level
✅ **Email Verification**: Optional, recommended for production

### SMART on FHIR Security

✅ **PKCE**: Proof Key for Code Exchange
✅ **State Parameter**: CSRF protection
✅ **Token Expiry**: Automatic tracking
✅ **Refresh Tokens**: Secure refresh flow
✅ **No Client Secrets**: Public client pattern

## Environment Variables

Required environment variables:

```bash
# Database
DATABASE_PATH=./data/auth.db

# Application
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Security
BETTER_AUTH_SECRET=your-secret-key

# Optional: Email verification
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## Database Setup

Better Auth automatically creates tables on first run:

```sql
-- users table
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  emailVerified INTEGER DEFAULT 0,
  name TEXT,
  createdAt INTEGER,
  updatedAt INTEGER,
  role TEXT,
  organization TEXT,
  npi TEXT UNIQUE,
  specialty TEXT
);

-- sessions table
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  token TEXT UNIQUE NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER,
  FOREIGN KEY (userId) REFERENCES user(id)
);
```

## Testing

### Test Better Auth

```bash
# 1. Start the app
bun dev

# 2. Sign up
curl -X POST http://localhost:3000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Test","email":"test@example.com","password":"password123"}'

# 3. Sign in
curl -X POST http://localhost:3000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test SMART Launch

1. Visit [SMART App Launcher](https://launch.smarthealthit.org)
2. Launch URL: `http://localhost:3000/auth/smart/login`
3. Complete OAuth flow
4. Access patient data

## Common Scenarios

### Scenario 1: New Clinician

```
1. Clinician registers → Better Auth creates account
2. Clinician signs in → Better Auth session created
3. Clinician launches from EHR → SMART flow
4. Access granted to both your app and patient data
```

### Scenario 2: Returning Clinician

```
1. Clinician signs in → Better Auth session restored
2. Launches from EHR → SMART flow
3. Both authentications active
```

### Scenario 3: Session Expiry

```
Better Auth Session:
- Expires after 7 days of inactivity
- Redirects to /auth/sign-in

SMART Token:
- Expires per EHR settings (typically 1 hour)
- Auto-refreshes if refresh_token available
- Shows expiry countdown
```

## Integration with Your Services

Use Better Auth user context to call your backend:

```typescript
'use client';

import { useAuth } from '@/hooks/use-auth';

export function YourComponent() {
  const { user, session } = useAuth();
  
  const callYourBackend = async () => {
    const response = await fetch('/api/your-service', {
      headers: {
        'Authorization': `Bearer ${session.token}`,
        'X-User-ID': user.id,
      },
    });
    return response.json();
  };
  
  // Use user.npi, user.organization, etc. for context
}
```

## Troubleshooting

### Better Auth Issues

**Problem**: "Failed to sign in"
- Check database connection
- Verify email/password
- Check browser console for errors

**Problem**: Session not persisting
- Check cookie settings
- Verify HTTPS in production
- Check browser privacy settings

### SMART on FHIR Issues

**Problem**: "Invalid redirect URI"
- Verify redirect URI in EHR registration
- Check BASE_URL in config.json
- Ensure exact match (including trailing slashes)

**Problem**: Token expired
- Use refresh token feature
- Check token expiry time
- Verify refresh_token scope

## Production Checklist

### Better Auth

- [ ] Set strong BETTER_AUTH_SECRET
- [ ] Enable email verification
- [ ] Configure production database
- [ ] Set up rate limiting
- [ ] Enable HTTPS only
- [ ] Configure CORS properly

### SMART on FHIR

- [ ] Register with Epic/Cerner/Athena
- [ ] Update CLIENT_ID
- [ ] Set production BASE_URL
- [ ] Test OAuth flow
- [ ] Verify redirect URIs
- [ ] Test token refresh

## Summary

**Better Auth** = Your app authentication
**SMART on FHIR** = EHR data access

Both work together to provide:
1. Secure access to your services
2. Secure access to patient data
3. Proper user context and permissions
4. Seamless clinical workflow

For more details:
- [Better Auth Docs](https://www.better-auth.com/)
- [SMART on FHIR Docs](https://build.fhir.org/ig/HL7/smart-app-launch/)
