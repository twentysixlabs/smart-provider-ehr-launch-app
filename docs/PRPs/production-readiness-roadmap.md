name: "SMART on FHIR Production Readiness Roadmap"
description: |
  Comprehensive production readiness gap analysis and implementation roadmap for deploying a 
  world-class SMART on FHIR application to Epic, Cerner, and Athena EHR systems.

---

## Goal

Identify and document all gaps, missing features, and enhancements required to transform the current SMART on FHIR application from a functional MVP into a world-class, production-ready healthcare application that meets the stringent requirements of Epic App Orchard, Cerner Code Console, and Athena Marketplace certification.

## Why

- **Regulatory Compliance**: HIPAA, HITECH, and state-level healthcare regulations require specific security and compliance measures
- **Vendor Certification**: Epic, Cerner, and Athena have strict app certification requirements for production deployment
- **Patient Safety**: Healthcare applications must be highly reliable, secure, and performant to avoid clinical errors
- **Enterprise Adoption**: Healthcare organizations require enterprise-grade features (SSO, audit logs, uptime SLAs)
- **Market Differentiation**: World-class UX, performance, and reliability separate successful healthcare apps from abandoned ones

## What

This document provides a comprehensive roadmap across 8 critical dimensions:

1. **Security & Compliance** (HIPAA, HITECH, BAA)
2. **Authentication & Authorization** (OAuth 2.0, RBAC, SSO)
3. **Observability & Monitoring** (Logging, metrics, alerting)
4. **Performance & Scalability** (Load testing, caching, CDN)
5. **Testing & Quality Assurance** (E2E tests, integration tests, accessibility)
6. **Deployment & DevOps** (CI/CD, blue-green deployments, rollback)
7. **User Experience & Accessibility** (WCAG 2.1 AA, mobile-first, i18n)
8. **Documentation & Training** (User guides, API docs, video tutorials)

---

## Critical Production Gaps (Must-Fix Before Launch)

### 🚨 Priority 1: Security & HIPAA Compliance

#### GAP-001: No Audit Logging for PHI Access

**Current State**: No logging of Protected Health Information (PHI) access

**Risk Level**: 🔴 **Critical** - HIPAA violation, failed audits, potential fines

**Requirement**:

HIPAA Security Rule § 164.312(b) requires:
- Who accessed PHI
- What PHI was accessed
- When it was accessed
- From where (IP address, device)
- Why (purpose of access)

**Implementation**:

```typescript
// src/lib/audit-logger.ts
import Axiom from '@axiomhq/js';

const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

interface PHIAccessEvent {
  userId: string;
  userName: string;
  userRole: string;
  patientId: string;
  resourceType: string;
  resourceId: string;
  action: 'read' | 'write' | 'delete';
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  purpose?: string;
  iss: string; // FHIR server
}

export async function logPHIAccess(event: PHIAccessEvent) {
  await axiom.ingest('phi-access-logs', [
    {
      ...event,
      _time: event.timestamp.toISOString(),
      // Do NOT log actual PHI data, only metadata
    },
  ]);
}
```

**Usage in FHIR Requests**:

```typescript
// src/lib/smart-auth.ts
export async function fetchFhirResource<T>(
  url: string,
  accessToken: string,
  context: {
    userId: string;
    userName: string;
    ipAddress: string;
  }
): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/fhir+json',
    },
  });

  // Log PHI access (including vendor information)
  await logPHIAccess({
    userId: context.userId,
    userName: context.userName,
    userRole: 'clinician',
    patientId: extractPatientId(url),
    resourceType: extractResourceType(url),
    resourceId: extractResourceId(url),
    action: 'read',
    ipAddress: context.ipAddress,
    userAgent: navigator.userAgent,
    timestamp: new Date(),
    iss: extractFhirBaseUrl(url),
    vendor: detectVendor(url), // NEW: Track Epic/Cerner/Athena
  });

  return response.json();
}
```

**⚠️ CRITICAL for Multi-Vendor Write Operations**:

All FHIR write operations MUST be logged with additional metadata:

```typescript
// src/lib/fhir-write.ts
export async function createFhirResource<T>(
  fhirBaseUrl: string,
  resourceType: string,
  resource: T,
  accessToken: string,
  context: { userId: string; userName: string; ipAddress: string }
): Promise<WriteResult<T>> {
  // Log BEFORE write attempt
  await logPHIAccess({
    userId: context.userId,
    userName: context.userName,
    userRole: 'clinician',
    patientId: (resource as any).subject?.reference?.split('/')[1],
    resourceType,
    resourceId: 'creating',
    action: 'write', // NEW: Track write operations
    ipAddress: context.ipAddress,
    userAgent: navigator.userAgent,
    timestamp: new Date(),
    iss: fhirBaseUrl,
    vendor: detectVendor(fhirBaseUrl),
    operationType: 'create', // NEW: create vs update
  });

  const response = await fetch(`${fhirBaseUrl}/${resourceType}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/fhir+json',
    },
    body: JSON.stringify(resource),
  });

  // Log result (success or failure)
  await logPHIAccess({
    ...previousLogData,
    success: response.ok,
    httpStatus: response.status,
    errorMessage: response.ok ? null : await response.text(),
  });

  return response.json();
}
```

**Axiom Query for Compliance Reports**:

```
// PHI Access by Vendor
['phi-access-logs']
| where _time > ago(30d)
| summarize count() by userId, patientId, resourceType, vendor
| order by count() desc

// Write Operations by Vendor (CRITICAL for multi-vendor launch)
['phi-access-logs']
| where action == 'write'
| where _time > ago(7d)
| summarize 
    total = count(),
    success = countif(success == true),
    failed = countif(success == false)
    by vendor, resourceType
| extend success_rate = (success * 100.0) / total
| order by failed desc

// Failed Write Operations (Alert if > 5% failure rate)
['phi-access-logs']
| where action == 'write' and success == false
| where _time > ago(1h)
| summarize count() by vendor, resourceType, errorMessage
```

**Validation**:
- [ ] All FHIR resource reads logged
- [ ] **All FHIR write operations logged (Epic, Cerner, Athena)**
- [ ] **Vendor identified in every log entry**
- [ ] Logs retained for 6 years (HIPAA requirement)
- [ ] Audit reports generated monthly
- [ ] Anomaly detection alerts configured
- [ ] **Write operation failure alerts configured (<5% failure rate)**

**Effort**: 3 days (READ) + 2 days (WRITE operations)
**Priority**: 🔴 P0 (Blocking production)

---

#### GAP-002: Encryption at Rest Not Implemented

**Current State**: SQLite database not encrypted, tokens in plaintext localStorage

**Risk Level**: 🔴 **Critical** - HIPAA violation if data breach occurs

**Requirement**: HIPAA Security Rule § 164.312(a)(2)(iv) requires encryption at rest

**Implementation**:

**Option 1: SQLite Encryption (SQLCipher)**

```typescript
// src/lib/auth.ts
import Database from 'better-sqlite3';
import SQLCipher from 'better-sqlite3-sqlcipher';

const db = new SQLCipher(env.DATABASE_PATH);
db.pragma(`key = '${env.DATABASE_ENCRYPTION_KEY}'`);
db.pragma('cipher_page_size = 4096');
db.pragma('kdf_iter = 256000');
```

**Option 2: Migrate to PostgreSQL + pgcrypto**

```sql
-- Enable pgcrypto extension
CREATE EXTENSION pgcrypto;

-- Encrypt sensitive fields
CREATE TABLE "user" (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  encrypted_npi TEXT,  -- Encrypted NPI
  encrypted_password TEXT
);

-- Insert encrypted data
INSERT INTO "user" (encrypted_npi)
VALUES (pgp_sym_encrypt('1234567890', 'encryption-key'));

-- Query encrypted data
SELECT pgp_sym_decrypt(encrypted_npi::bytea, 'encryption-key') FROM "user";
```

**Token Encryption in localStorage**:

```typescript
// src/lib/storage.ts
import { encrypt, decrypt } from '@/lib/crypto';

export const secureStorage = {
  setItem: (key: string, value: string) => {
    const encrypted = encrypt(value, process.env.NEXT_PUBLIC_ENCRYPTION_KEY!);
    localStorage.setItem(key, encrypted);
  },
  
  getItem: (key: string): string | null => {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;
    return decrypt(encrypted, process.env.NEXT_PUBLIC_ENCRYPTION_KEY!);
  },
};
```

⚠️ **Note**: Encryption key management is critical. Use AWS KMS, HashiCorp Vault, or similar.

**Validation**:
- [ ] Database files encrypted at rest
- [ ] Tokens encrypted in localStorage
- [ ] Encryption keys rotated quarterly
- [ ] Key management documented

**Effort**: 5 days
**Priority**: 🔴 P0 (Blocking production)

---

#### GAP-003: No Rate Limiting (Brute-Force Vulnerability)

**Current State**: No protection against brute-force attacks on login endpoints

**Risk Level**: 🟠 **High** - Account takeover, credential stuffing attacks

**Implementation**:

**Option 1: Upstash Rate Limiting (Serverless-friendly)**

```bash
bun add @upstash/ratelimit @upstash/redis
```

```typescript
// src/lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 requests per minute
  analytics: true,
});
```

**Usage in API Routes**:

```typescript
// src/app/api/auth/sign-in/route.ts
import { rateLimiter } from '@/lib/rate-limit';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const ip = req.ip ?? '127.0.0.1';
  const { success, limit, remaining, reset } = await rateLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  }

  // Proceed with sign-in logic
  // ...
}
```

**Option 2: Cloudflare Rate Limiting (If using Cloudflare Pages)**

```javascript
// wrangler.jsonc
{
  "name": "smart-fhir-app",
  "routes": [
    {
      "pattern": "/api/auth/sign-in",
      "rate_limit": {
        "threshold": 5,
        "period": 60
      }
    }
  ]
}
```

**Validation**:
- [ ] Login endpoint limited to 5 attempts/minute
- [ ] Token refresh limited to 10 attempts/minute
- [ ] FHIR API calls limited to 100 requests/minute
- [ ] Rate limit headers returned in responses

**Effort**: 2 days
**Priority**: 🔴 P0

---

#### GAP-004: Incomplete Content Security Policy (XSS Risk)

**Current State**: No CSP header, vulnerable to XSS attacks

**Risk Level**: 🟠 **High** - XSS can steal tokens, access PHI

**Implementation**:

```typescript
// next.config.ts
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live", // Remove unsafe-* in prod
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://*.epic.com https://*.cerner.com https://*.athenahealth.com",
            "frame-ancestors 'self' https://*.epic.com https://*.cerner.com",
            "base-uri 'self'",
            "form-action 'self'",
            "upgrade-insecure-requests",
          ].join('; '),
        },
      ],
    },
  ];
}
```

**Validation**:
- [ ] CSP header present on all pages
- [ ] No CSP violations in browser console
- [ ] Inline scripts use nonces in production
- [ ] CSP report-uri configured for violation monitoring

**Effort**: 2 days
**Priority**: 🟠 P1

---

#### GAP-005: No Business Associate Agreement (BAA) for Cloud Providers

**Current State**: No BAA signed with Vercel/Cloudflare

**Risk Level**: 🔴 **Critical** - HIPAA violation if hosting PHI without BAA

**⚠️ CRITICAL UPDATE for Multi-Vendor Launch**:

Since the multi-vendor deployment strategy uses vendor-specific subdomains (epic.yourdomain.com, cerner.yourdomain.com, athena.yourdomain.com), BAA requirements extend to:

1. **Primary Hosting Provider** (Vercel/Cloudflare/AWS)
2. **Monitoring & Logging** (Axiom)
3. **Analytics** (PostHog - only if tracking non-PHI events)
4. **Caching** (Upstash Redis/Vercel KV)
5. **Rate Limiting** (Upstash)

**Action Items**:

1. **Vercel**:
   - Upgrade to Enterprise plan ($2,500/month+) to get BAA
   - Contact Vercel sales: enterprise@vercel.com
   - Complete BAA paperwork (2-4 weeks)
   - **IMPORTANT**: BAA covers all subdomains under your account

2. **Cloudflare**:
   - Contact Cloudflare for HIPAA compliance add-on
   - Sign BAA with Cloudflare
   - Configure Cloudflare for all vendor subdomains

3. **Alternative: AWS with HIPAA Compliance**:
   - Use AWS (inherently HIPAA-eligible)
   - Sign AWS BAA (free, self-service)
   - Deploy on ECS Fargate or App Runner
   - Use Route 53 for vendor-specific subdomains

4. **Axiom (Logging & Monitoring)**:
   - Contact Axiom sales for BAA
   - Axiom is HIPAA-compliant but requires BAA
   - Cost: Included in Enterprise plan

5. **Upstash (Redis/Rate Limiting)**:
   - Contact Upstash for BAA
   - Upstash supports HIPAA compliance
   - Cost: Included in Pro plan

6. **PostHog (Analytics)**:
   - ⚠️ **Do NOT send PHI to PostHog**
   - BAA may not be required if only tracking non-PHI events
   - Ensure autocapture is disabled
   - Legal review recommended

**Validation**:
- [ ] BAA signed with primary hosting provider
- [ ] BAA signed with Axiom (logging)
- [ ] BAA signed with Upstash (caching/rate limiting)
- [ ] BAA signed with any third-party services handling PHI
- [ ] **BAA covers all vendor-specific subdomains**
- [ ] Legal review completed
- [ ] BAA documents stored securely
- [ ] BAA renewal dates tracked

**Effort**: 4 weeks (legal + procurement)
**Priority**: 🔴 P0 (Blocking production)

---

### 🔐 Priority 2: Authentication & Authorization

#### GAP-006: No Role-Based Access Control (RBAC)

**Current State**: All authenticated users have same permissions

**Risk Level**: 🟠 **High** - Privilege escalation, unauthorized PHI access

**Requirement**: HIPAA requires minimum necessary access (§ 164.502(b))

**Implementation**:

```typescript
// src/types/auth.ts
export type UserRole = 
  | 'clinician'        // Can view patient data
  | 'admin'            // Can manage users, view audit logs
  | 'support'          // Read-only access for troubleshooting
  | 'billing';         // Financial data only, no clinical access

export interface Permission {
  resource: string;    // 'patient', 'audit_logs', 'settings'
  action: 'read' | 'write' | 'delete';
}

export const rolePermissions: Record<UserRole, Permission[]> = {
  clinician: [
    { resource: 'patient', action: 'read' },
    { resource: 'fhir_api', action: 'read' },
  ],
  admin: [
    { resource: 'patient', action: 'read' },
    { resource: 'users', action: 'write' },
    { resource: 'audit_logs', action: 'read' },
    { resource: 'settings', action: 'write' },
  ],
  support: [
    { resource: 'patient', action: 'read' },
    { resource: 'audit_logs', action: 'read' },
  ],
  billing: [
    { resource: 'billing', action: 'write' },
  ],
};
```

**Middleware for RBAC**:

```typescript
// src/middleware.ts
import { hasPermission } from '@/lib/rbac';

export async function middleware(request: NextRequest) {
  const session = await getSession(request);
  
  // Check if route requires specific permission
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!hasPermission(session.user.role, 'settings', 'read')) {
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
  }
  
  return NextResponse.next();
}
```

**Validation**:
- [ ] RBAC enforced on all protected routes
- [ ] Permissions checked server-side (never client-only)
- [ ] Audit log includes user role in all entries
- [ ] Role assignment requires admin approval

**Effort**: 5 days
**Priority**: 🟠 P1

---

#### GAP-007: No Single Sign-On (SSO) Support

**Current State**: Only email/password login

**Risk Level**: 🟡 **Medium** - Enterprise adoption blocker

**Requirement**: Enterprise customers require SAML/OIDC SSO

**Implementation**:

**Option 1: Better Auth with OAuth Providers**

```typescript
// src/lib/auth.ts
import { betterAuth } from 'better-auth';
import { google, microsoft } from 'better-auth/providers';

export const auth = betterAuth({
  // ... existing config
  
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenant: 'common', // or specific tenant ID
    },
  },
});
```

**Option 2: SAML 2.0 (Enterprise)**

```bash
bun add @boxyhq/saml-jackson
```

```typescript
// src/lib/saml.ts
import jackson from '@boxyhq/saml-jackson';

const samlHandler = await jackson({
  externalUrl: process.env.NEXT_PUBLIC_APP_URL!,
  samlAudience: process.env.SAML_AUDIENCE!,
  samlPath: '/api/auth/saml',
  db: {
    engine: 'sql',
    type: 'postgres',
    url: process.env.DATABASE_URL!,
  },
});

export default samlHandler;
```

**Validation**:
- [ ] Google Workspace SSO tested
- [ ] Microsoft Entra ID (Azure AD) SSO tested
- [ ] SAML 2.0 tested with Okta
- [ ] SSO onboarding documentation created

**Effort**: 10 days
**Priority**: 🟡 P2

---

#### GAP-008: No Refresh Token Auto-Renewal

**Current State**: User must manually click "Refresh Token" button

**Risk Level**: 🟡 **Medium** - Poor UX, session disruption

**Implementation**:

```typescript
// src/hooks/use-token-refresh.ts
import { useEffect } from 'react';
import { useTokenStore } from '@/stores/token-store';
import { refreshAccessToken } from '@/lib/smart-auth';

export function useAutoTokenRefresh() {
  const token = useTokenStore((state) => state.token);
  const setToken = useTokenStore((state) => state.setToken);

  useEffect(() => {
    if (!token?.refresh_token) return;

    // Calculate time until expiry
    const expiresAt = token.token_expiry || Date.now() + token.expires_in * 1000;
    const timeUntilExpiry = expiresAt - Date.now();
    
    // Refresh 5 minutes before expiry
    const refreshTime = timeUntilExpiry - 5 * 60 * 1000;

    if (refreshTime <= 0) {
      // Token already expired, refresh immediately
      refreshToken();
      return;
    }

    const timerId = setTimeout(async () => {
      await refreshToken();
    }, refreshTime);

    return () => clearTimeout(timerId);
  }, [token]);

  async function refreshToken() {
    if (!token?.refresh_token) return;
    
    try {
      const newToken = await refreshAccessToken(
        token.refresh_token,
        config.CLIENT_ID
      );
      
      setToken({
        ...token,
        access_token: newToken.access_token,
        expires_in: newToken.expires_in,
        token_expiry: Date.now() + newToken.expires_in * 1000,
      });
      
      console.log('Token auto-refreshed successfully');
    } catch (error) {
      console.error('Auto-refresh failed:', error);
      // Show user notification to re-authenticate
    }
  }
}
```

**Usage**:

```typescript
// src/app/layout.tsx
'use client';

import { useAutoTokenRefresh } from '@/hooks/use-token-refresh';

export function Providers({ children }) {
  useAutoTokenRefresh(); // Run globally
  
  return <>{children}</>;
}
```

**Validation**:
- [ ] Token refreshes 5 minutes before expiry
- [ ] User sees no interruption in workflow
- [ ] Failed refresh shows notification
- [ ] Refresh logged in audit trail

**Effort**: 2 days
**Priority**: 🟡 P2

---

### 📊 Priority 3: Observability & Monitoring

#### GAP-009: No Production Monitoring or Alerting

**Current State**: No visibility into production errors, performance, or usage

**Risk Level**: 🟠 **High** - Cannot detect outages, performance issues, or security incidents

**Implementation**:

**Option 1: Axiom (Recommended for Healthcare)**

```bash
bun add @axiomhq/js next-axiom
```

```typescript
// src/lib/axiom.ts
import { Axiom } from '@axiomhq/js';

export const axiom = new Axiom({
  token: process.env.AXIOM_TOKEN!,
  orgId: process.env.AXIOM_ORG_ID!,
});

export async function logError(error: Error, context?: Record<string, any>) {
  await axiom.ingest('errors', [
    {
      _time: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      ...context,
    },
  ]);
}

export async function logEvent(event: string, data: Record<string, any>) {
  await axiom.ingest('events', [
    {
      _time: new Date().toISOString(),
      event,
      ...data,
    },
  ]);
}
```

**Error Boundary with Logging**:

```typescript
// src/components/error-boundary.tsx
'use client';

import { Component, type ReactNode } from 'react';
import { logError } from '@/lib/axiom';

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    logError(error, {
      componentStack: errorInfo.componentStack,
      userId: this.props.userId,
      route: window.location.pathname,
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**Key Axiom Queries**:

```
// Error rate by endpoint
['errors']
| where _time > ago(1h)
| summarize count() by route
| order by count() desc

// Slow API responses (P95 > 2 seconds)
['http.request']
| where duration > 2000
| summarize percentiles(duration, 95) by endpoint

// PHI access by user
['phi-access-logs']
| where _time > ago(24h)
| summarize count() by userId, userName
| order by count() desc

// ⚠️ CRITICAL for Multi-Vendor Launch: Vendor-Specific Queries

// SMART Launch Success Rate by Vendor
['smart-launch-events']
| where _time > ago(24h)
| summarize 
    total = count(),
    success = countif(status == 'success'),
    failed = countif(status == 'failed')
    by vendor
| extend success_rate = (success * 100.0) / total
| order by success_rate asc
// ALERT: If any vendor < 95% success rate

// Write Operation Failures by Vendor
['phi-access-logs']
| where action == 'write'
| where success == false
| where _time > ago(1h)
| summarize count() by vendor, resourceType, errorMessage
| order by count() desc
// ALERT: If any vendor > 5% failure rate

// API Latency by Vendor (P95)
['http.request']
| where path startswith '/fhir'
| where _time > ago(1h)
| summarize p95 = percentiles(duration, 95) by vendor
| where p95 > 2000
// ALERT: If any vendor P95 > 2 seconds

// Token Refresh Failures by Vendor
['auth-events']
| where event == 'token_refresh'
| where success == false
| where _time > ago(1h)
| summarize count() by vendor
// ALERT: If any vendor > 5 failures/hour
```

**Slack Alerts**:

```typescript
// Axiom Monitors → Create Monitor
{
  "name": "High Error Rate",
  "query": "['errors'] | where _time > ago(5m) | summarize count()",
  "threshold": 10,
  "action": "slack_webhook",
  "webhook_url": process.env.SLACK_WEBHOOK_URL,
}

// ⚠️ CRITICAL Multi-Vendor Alerts

// Epic Launch Failure Alert
{
  "name": "Epic SMART Launch Failures",
  "query": "['smart-launch-events'] | where vendor == 'epic' | where status == 'failed' | where _time > ago(15m) | summarize count()",
  "threshold": 5,
  "action": "slack_webhook",
  "webhook_url": process.env.SLACK_WEBHOOK_URL,
  "severity": "critical",
}

// Cerner Launch Failure Alert
{
  "name": "Cerner SMART Launch Failures",
  "query": "['smart-launch-events'] | where vendor == 'cerner' | where status == 'failed' | where _time > ago(15m) | summarize count()",
  "threshold": 5,
  "action": "slack_webhook",
  "webhook_url": process.env.SLACK_WEBHOOK_URL,
  "severity": "critical",
}

// Athena Launch Failure Alert
{
  "name": "Athena SMART Launch Failures",
  "query": "['smart-launch-events'] | where vendor == 'athena' | where status == 'failed' | where _time > ago(15m) | summarize count()",
  "threshold": 5,
  "action": "slack_webhook",
  "webhook_url": process.env.SLACK_WEBHOOK_URL,
  "severity": "critical",
}

// Write Operation Failure Alert (Any Vendor)
{
  "name": "FHIR Write Failures",
  "query": "['phi-access-logs'] | where action == 'write' | where success == false | where _time > ago(15m) | summarize count() by vendor",
  "threshold": 10,
  "action": "slack_webhook",
  "webhook_url": process.env.SLACK_WEBHOOK_URL,
  "severity": "high",
}

// High API Latency Alert (Per Vendor)
{
  "name": "High API Latency - Epic",
  "query": "['http.request'] | where vendor == 'epic' | where _time > ago(5m) | summarize p95 = percentiles(duration, 95)",
  "threshold": 3000, // 3 seconds
  "action": "slack_webhook",
  "webhook_url": process.env.SLACK_WEBHOOK_URL,
  "severity": "warning",
}
```

**Validation**:
- [ ] All errors logged to Axiom
- [ ] Slack alerts configured for critical errors
- [ ] Dashboard created for key metrics
- [ ] Axiom retention set to 6 years (HIPAA)
- [ ] **Vendor-specific alerts configured (Epic, Cerner, Athena)**
- [ ] **Write operation failure alerts configured**
- [ ] **Launch failure alerts configured per vendor**
- [ ] **API latency alerts configured per vendor**

**Effort**: 4 days + 2 days (vendor-specific)
**Priority**: 🟠 P1

---

#### GAP-010: No User Analytics (PostHog)

**Current State**: No visibility into user behavior, feature adoption, or conversion funnels

**Risk Level**: 🟢 **Low** - Product development blocker, not security/compliance

**Implementation**:

```bash
bun add posthog-js
```

```typescript
// src/lib/posthog.ts
import posthog from 'posthog-js';

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: 'https://app.posthog.com',
    capture_pageview: false, // Manually track pages
    autocapture: false,      // HIPAA: Disable auto-capture (may capture PHI)
  });
}

export { posthog };
```

**Track Key Events**:

```typescript
// src/app/patient/page.tsx
'use client';

import { useEffect } from 'react';
import { posthog } from '@/lib/posthog';

export default function PatientPage() {
  useEffect(() => {
    posthog.capture('patient_page_viewed', {
      userId: user.id,
      // DO NOT include patient ID or PHI
    });
  }, []);
  
  return <PatientDataViewer />;
}
```

**Key Events to Track**:

| Event | Properties | Purpose |
|-------|-----------|---------|
| `smart_launch_started` | `iss`, `launch_type` | Track EHR launches |
| `smart_launch_completed` | `iss`, `duration_ms` | Measure OAuth success rate |
| `patient_page_viewed` | `userId` | Track feature adoption |
| `token_refreshed` | `auto` (boolean) | Monitor refresh reliability |
| `error_occurred` | `errorType`, `route` | Track error patterns |

**Feature Flags**:

```typescript
// src/lib/feature-flags.ts
export function useFeatureFlag(flag: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isEnabled = posthog.isFeatureEnabled(flag);
    setEnabled(isEnabled);
  }, [flag]);

  return enabled;
}
```

**Validation**:
- [ ] PostHog SDK integrated
- [ ] Key events tracked
- [ ] Feature flags configured
- [ ] PHI never sent to PostHog

**Effort**: 3 days
**Priority**: 🟡 P2

---

### 🚀 Priority 4: Performance & Scalability

#### GAP-011: No Load Testing or Performance Benchmarks

**Current State**: Unknown performance characteristics under load

**Risk Level**: 🟠 **High** - May crash or become unusable under peak load

**Implementation**:

**Option 1: k6 Load Testing**

```bash
bun add -D k6
```

```javascript
// tests/load/smart-launch-flow.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp-up to 50 users
    { duration: '5m', target: 50 },   // Stay at 50 users
    { duration: '2m', target: 100 },  // Ramp-up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 0 },    // Ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests < 2s
    http_req_failed: ['rate<0.01'],    // <1% errors
  },
};

export default function () {
  // Test SMART launch flow
  const launchRes = http.get('https://app.yourdomain.com/auth/smart/login?iss=https://fhir.epic.com&launch=test');
  check(launchRes, {
    'launch page loaded': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);

  // Test patient page
  const patientRes = http.get('https://app.yourdomain.com/patient', {
    headers: {
      Cookie: launchRes.cookies.get('session'),
    },
  });
  check(patientRes, {
    'patient page loaded': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(2);
}
```

**Run Load Tests**:

```bash
k6 run tests/load/smart-launch-flow.js
```

**Performance Budgets**:

| Metric | Target | P95 Threshold | P99 Threshold |
|--------|--------|---------------|---------------|
| **Time to Interactive (TTI)** | < 3s | 5s | 8s |
| **First Contentful Paint (FCP)** | < 1s | 2s | 3s |
| **Largest Contentful Paint (LCP)** | < 2.5s | 3.5s | 4.5s |
| **API Response Time** | < 500ms | 1s | 2s |
| **FHIR API Response Time** | < 1s | 2s | 3s |

**Validation**:
- [ ] Load tests pass with 100 concurrent users
- [ ] Performance budgets met
- [ ] Load tests run in CI/CD pipeline
- [ ] Performance dashboard created

**Effort**: 5 days
**Priority**: 🟠 P1

---

#### GAP-012: No Caching Strategy

**Current State**: Every FHIR request hits the API, no caching

**Risk Level**: 🟡 **Medium** - Poor performance, high API costs, slow UX

**Implementation**:

**React Query Cache Configuration**:

```typescript
// src/app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // Data fresh for 5 minutes
      cacheTime: 10 * 60 * 1000,       // Keep in cache for 10 minutes
      retry: 3,                         // Retry failed requests 3 times
      retryDelay: (attemptIndex) =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,      // Refetch when window regains focus
      refetchOnReconnect: true,        // Refetch when reconnecting
    },
  },
});

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

**Server-Side Caching (Vercel KV or Upstash Redis)**:

```bash
bun add @vercel/kv
```

```typescript
// src/lib/cache.ts
import { kv } from '@vercel/kv';

export async function getCachedFhirResource<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes
): Promise<T> {
  // Try cache first
  const cached = await kv.get<T>(key);
  if (cached) {
    console.log(`Cache HIT: ${key}`);
    return cached;
  }

  // Cache miss, fetch fresh data
  console.log(`Cache MISS: ${key}`);
  const data = await fetcher();
  
  // Store in cache
  await kv.setex(key, ttl, data);
  
  return data;
}
```

**Usage**:

```typescript
// src/hooks/use-fhir-query.ts
export function usePatientQuery(fhirBaseUrl: string | null, token: TokenData | null) {
  return useQuery({
    queryKey: ['fhir', 'Patient', token?.patient],
    queryFn: async () => {
      return getCachedFhirResource(
        `patient:${token.patient}`,
        async () => {
          const url = `${fhirBaseUrl}/Patient/${token.patient}`;
          return fetchFhirResource<Patient>(url, token.access_token);
        },
        5 * 60 // Cache for 5 minutes
      );
    },
    enabled: Boolean(fhirBaseUrl && token?.access_token && token?.patient),
  });
}
```

**Validation**:
- [ ] Cache hit rate > 60%
- [ ] API calls reduced by 50%+
- [ ] Cache invalidation works correctly
- [ ] Stale data served < 1% of time

**Effort**: 3 days
**Priority**: 🟡 P2

---

### 🧪 Priority 5: Testing & Quality Assurance

#### GAP-013: No End-to-End (E2E) Tests

**Current State**: Only unit tests, no E2E tests for critical flows

**Risk Level**: 🟠 **High** - May ship broken SMART launch flow, OAuth errors

**⚠️ CRITICAL UPDATE for Multi-Vendor Launch**:

E2E tests MUST cover all three vendors (Epic, Cerner, Athena) separately, as each has unique OAuth flows, scope formats, and error handling requirements.

**Implementation**:

**Playwright Setup**:

```bash
bun add -D @playwright/test
npx playwright install
```

```typescript
// tests/e2e/smart-launch.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SMART Launch Flow - Generic', () => {
  test('should complete EHR launch flow', async ({ page }) => {
    // 1. Navigate to SMART Launcher
    await page.goto('https://launch.smarthealthit.org');

    // 2. Configure launch parameters
    await page.fill('input[name="iss"]', 'https://launch.smarthealthit.org/v/r4/fhir');
    await page.fill('input[name="launch_url"]', 'http://localhost:3000/auth/smart/login');
    await page.click('button:has-text("Launch")');

    // 3. Wait for redirect to app
    await page.waitForURL('**/auth/smart/login**');

    // 4. Should redirect to authorization
    await page.waitForURL('**/authorize**');

    // 5. Approve authorization
    await page.click('button:has-text("Authorize")');

    // 6. Should redirect back to callback
    await page.waitForURL('**/auth/smart/callback**');

    // 7. Should redirect to patient page
    await page.waitForURL('**/patient**', { timeout: 10000 });

    // 8. Verify patient banner loaded
    await expect(page.locator('h2:has-text("Patient")')).toBeVisible();

    // 9. Verify data cards loaded
    await expect(page.locator('text=Observations')).toBeVisible();
    await expect(page.locator('text=Conditions')).toBeVisible();
  });

  test('should show error for invalid launch', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/smart/login');
    await expect(page.locator('text=Missing required parameters')).toBeVisible();
  });

  test('should refresh token before expiry', async ({ page }) => {
    // TODO: Implement token refresh test
  });
});
```

**⚠️ NEW: Vendor-Specific E2E Tests**:

```typescript
// tests/e2e/epic-launch.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Epic SMART Launch', () => {
  test('should complete Epic launch with .rs scopes', async ({ page }) => {
    // Use Epic sandbox environment
    const epicIss = 'https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4';
    
    await page.goto(`http://localhost:3000/auth/smart/login?iss=${epicIss}&launch=test-launch`);
    
    // Verify Epic OAuth redirect
    await page.waitForURL('**/oauth2/authorize**');
    
    // Verify scopes use .rs format (Epic-specific)
    const url = page.url();
    expect(url).toContain('patient%2FObservation.rs'); // Epic .rs scope
    expect(url).not.toContain('patient%2FObservation.read'); // NOT .read
    
    // Continue Epic OAuth flow...
  });
  
  test('should load Epic patient banner styles', async ({ page }) => {
    // After successful launch
    await page.goto('http://localhost:3000/patient');
    
    // Verify smart_style_url CSS loaded
    const styleLinks = await page.locator('link[rel="stylesheet"]').all();
    const hasEpicStyles = await Promise.all(
      styleLinks.map(async (link) => {
        const href = await link.getAttribute('href');
        return href?.includes('epic.com/smart-style');
      })
    );
    
    expect(hasEpicStyles.some(Boolean)).toBe(true);
  });
  
  test('should handle Epic-specific errors', async ({ page }) => {
    // Test Epic scope denial error
    // TODO: Simulate Epic scope denial
  });
});

// tests/e2e/cerner-launch.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Cerner SMART Launch', () => {
  test('should complete Cerner launch with .read scopes', async ({ page }) => {
    // Use Cerner sandbox environment
    const cernerIss = 'https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d';
    
    await page.goto(`http://localhost:3000/auth/smart/login?iss=${cernerIss}&launch=test-launch`);
    
    // Verify Cerner OAuth redirect
    await page.waitForURL('**/tenants/ec2458f2-1e24-41c8-b71b-0e701af7583d/protocols/oauth2/profiles/smart-v1/authorize**');
    
    // Verify scopes use .read format (Cerner-specific)
    const url = page.url();
    expect(url).toContain('patient%2FObservation.read'); // Cerner .read scope
    expect(url).not.toContain('patient%2FObservation.rs'); // NOT .rs
    
    // Continue Cerner OAuth flow...
  });
  
  test('should extract Cerner tenant ID', async ({ page }) => {
    const cernerIss = 'https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d';
    
    await page.goto(`http://localhost:3000/auth/smart/login?iss=${cernerIss}`);
    
    // Verify tenant ID in storage
    const tenantId = await page.evaluate(() => 
      localStorage.getItem('vendor-tenant-id')
    );
    expect(tenantId).toBe('ec2458f2-1e24-41c8-b71b-0e701af7583d');
  });
});

// tests/e2e/athena-launch.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Athena SMART Launch', () => {
  test('should complete Athena launch', async ({ page }) => {
    // Use Athena sandbox environment
    const athenaIss = 'https://api.preview.platform.athenahealth.com/fhir/r4';
    
    await page.goto(`http://localhost:3000/auth/smart/login?iss=${athenaIss}&launch=test-launch`);
    
    // Verify Athena OAuth redirect
    await page.waitForURL('**/oauth2/v1/authorize**');
    
    // Continue Athena OAuth flow...
  });
  
  test('should extract Athena practice ID', async ({ page }) => {
    const athenaIss = 'https://api.preview.platform.athenahealth.com/fhir/r4/12345';
    
    await page.goto(`http://localhost:3000/auth/smart/login?iss=${athenaIss}`);
    
    // Verify practice ID in storage
    const practiceId = await page.evaluate(() => 
      localStorage.getItem('vendor-practice-id')
    );
    expect(practiceId).toBe('12345');
  });
  
  test('should handle Athena rate limiting', async ({ page }) => {
    // Simulate multiple rapid requests
    // Verify rate limit handling (10 req/s per practice)
    // TODO: Implement rate limit test
  });
});
```

**⚠️ NEW: Write Operations E2E Tests**:

```typescript
// tests/e2e/fhir-write.spec.ts
import { test, expect } from '@playwright/test';

test.describe('FHIR Write Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Complete SMART launch and navigate to patient page
    // TODO: Setup authenticated session
  });
  
  test('should create clinical note in Epic', async ({ page }) => {
    await page.goto('http://localhost:3000/patient/write/note');
    
    // Fill out note form
    await page.fill('input[name="title"]', 'E2E Test Note');
    await page.fill('textarea[name="content"]', 'This is a test clinical note created by E2E tests.');
    await page.selectOption('select[name="category"]', 'progress-note');
    
    // Submit form
    await page.click('button:has-text("Save Note to EHR")');
    
    // Verify success message
    await expect(page.locator('text=Clinical note created successfully')).toBeVisible({ timeout: 10000 });
    
    // Verify audit log
    // TODO: Check Axiom for audit log entry
  });
  
  test('should validate FHIR resource before create', async ({ page }) => {
    await page.goto('http://localhost:3000/patient/write/note');
    
    // Submit without required fields
    await page.click('button:has-text("Save Note to EHR")');
    
    // Verify validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
    await expect(page.locator('text=Note content must be at least 10 characters')).toBeVisible();
  });
  
  test('should handle write permission denied', async ({ page }) => {
    // Simulate user without write scopes
    // Verify write UI is disabled
    await page.goto('http://localhost:3000/patient');
    
    const createButton = page.locator('button:has-text("Create Note")');
    await expect(createButton).toBeDisabled();
    await expect(page.locator('text=Read-only access')).toBeVisible();
  });
  
  test('should handle version conflict (409)', async ({ page }) => {
    // Simulate concurrent edit scenario
    // TODO: Implement version conflict test
  });
});
```

**Run E2E Tests**:

```bash
npx playwright test
npx playwright test --ui  # Interactive UI
```

**GitHub Actions E2E Pipeline**:

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '22'
      - run: bun install
      - run: bun run build
      - run: bun run start &
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

**Validation**:
- [ ] SMART launch flow E2E test passes
- [ ] **Epic SMART launch E2E test passes (with .rs scopes)**
- [ ] **Cerner SMART launch E2E test passes (with .read scopes)**
- [ ] **Athena SMART launch E2E test passes**
- [ ] Token refresh E2E test passes
- [ ] Error handling E2E tests pass
- [ ] **Write operations E2E tests pass (all vendors)**
- [ ] **FHIR validation E2E tests pass**
- [ ] **Permission denied scenarios tested**
- [ ] E2E tests run in CI/CD

**Effort**: 8 days (generic) + 6 days (vendor-specific) + 4 days (write operations) = 18 days
**Priority**: 🔴 P0

---

#### GAP-014: Insufficient Component Test Coverage (45%)

**Current State**: Only 3 component tests, 45% coverage

**Risk Level**: 🟡 **Medium** - UI regressions may ship to production

**Critical Components to Test**:

1. **PatientBanner** (highest risk)
2. **LabsTable**
3. **DataViewer**
4. **PatientDataTabs**
5. **TokenExpiryWarning**

**Example Test**:

```typescript
// src/components/patient/__tests__/patient-banner.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PatientBanner } from '../patient-banner';
import type { Patient } from '@/types/fhir';

describe('PatientBanner', () => {
  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: '123',
    name: [{ family: 'Doe', given: ['John'] }],
    gender: 'male',
    birthDate: '1980-01-01',
  };

  it('should render patient name', () => {
    render(<PatientBanner patient={mockPatient} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should render patient demographics', () => {
    render(<PatientBanner patient={mockPatient} />);
    expect(screen.getByText('Male')).toBeInTheDocument();
    expect(screen.getByText(/Born/)).toBeInTheDocument();
  });

  it('should handle missing name gracefully', () => {
    const patientNoName = { ...mockPatient, name: undefined };
    render(<PatientBanner patient={patientNoName} />);
    expect(screen.getByText('Unknown Patient')).toBeInTheDocument();
  });
});
```

**Coverage Target**: 80% for all components

**Validation**:
- [ ] PatientBanner test coverage > 80%
- [ ] LabsTable test coverage > 80%
- [ ] All critical components tested
- [ ] Tests run in CI/CD

**Effort**: 6 days
**Priority**: 🟡 P2

---

#### GAP-015: No Accessibility (a11y) Testing

**Current State**: No automated accessibility testing

**Risk Level**: 🟠 **High** - May violate Section 508, ADA compliance

**Implementation**:

**axe-core with Playwright**:

```bash
bun add -D @axe-core/playwright
```

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('patient page should have no a11y violations', async ({ page }) => {
    await page.goto('http://localhost:3000/patient');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(results.violations).toEqual([]);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('http://localhost:3000/patient');

    // Tab through all interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('role', 'button');
    
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('role', 'tab');
  });
});
```

**Manual a11y Testing Checklist**:

- [ ] All interactive elements keyboard-accessible
- [ ] Focus indicators visible and clear
- [ ] Screen reader announces all content correctly
- [ ] Color contrast meets WCAG AA (4.5:1 for text)
- [ ] Alt text on all images
- [ ] ARIA labels on all interactive elements
- [ ] Form inputs have associated labels

**Validation**:
- [ ] Zero critical a11y violations
- [ ] WCAG 2.1 AA compliance verified
- [ ] Keyboard navigation works end-to-end
- [ ] Screen reader tested (NVDA or JAWS)

**Effort**: 4 days
**Priority**: 🟠 P1

---

### 🚢 Priority 6: Deployment & DevOps

#### GAP-016: No CI/CD Pipeline

**Current State**: Manual deployments, no automated testing before deploy

**Risk Level**: 🟠 **High** - May ship broken code to production

**Implementation**:

**GitHub Actions CI/CD**:

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        with:
          bun-version: 1.3.0
      
      - name: Install dependencies
        run: bun install
      
      - name: Lint
        run: bun run lint
      
      - name: Type check
        run: bun run type-check
      
      - name: Unit tests
        run: bun run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  e2e:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - run: bun run start &
      - run: npx playwright install --with-deps
      - run: npx playwright test

  deploy-staging:
    if: github.ref == 'refs/heads/staging'
    needs: [test, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - name: Deploy to Vercel Staging
        run: vercel --token ${{ secrets.VERCEL_TOKEN }}

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: [test, e2e]
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run build
      - name: Deploy to Vercel Production
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

**Validation**:
- [ ] All tests pass before deployment
- [ ] Staging deploy on every commit to `staging` branch
- [ ] Production deploy on every commit to `main` branch
- [ ] Failed tests block deployment

**Effort**: 3 days
**Priority**: 🟠 P1

---

#### GAP-017: No Blue-Green Deployment or Canary Rollout

**Current State**: Deployments directly to production, all-or-nothing

**Risk Level**: 🟡 **Medium** - Cannot safely test in production, no gradual rollout

**Implementation**:

**Vercel Preview Deployments + Feature Flags**:

```typescript
// src/lib/feature-flags.ts
import { posthog } from './posthog';

export function useFeatureFlag(flag: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Check PostHog feature flag
    const isEnabled = posthog.isFeatureEnabled(flag);
    setEnabled(isEnabled);
  }, [flag]);

  return enabled;
}
```

**PostHog Feature Flag Configuration**:

```typescript
// PostHog Dashboard → Feature Flags
{
  "flag": "new_patient_viewer",
  "enabled": true,
  "rollout_percentage": 10,  // Start at 10%
  "filters": {
    "groups": [
      {
        "properties": [
          {
            "key": "email",
            "value": "beta-users@hospital.com",
            "operator": "exact"
          }
        ]
      }
    ]
  }
}
```

**Usage in Components**:

```typescript
// src/app/patient/page.tsx
'use client';

import { useFeatureFlag } from '@/lib/feature-flags';
import { PatientViewerV1 } from '@/components/patient/patient-viewer-v1';
import { PatientViewerV2 } from '@/components/patient/patient-viewer-v2';

export default function PatientPage() {
  const useV2Viewer = useFeatureFlag('new_patient_viewer');

  return useV2Viewer ? <PatientViewerV2 /> : <PatientViewerV1 />;
}
```

**Canary Rollout Plan**:

1. **Day 0**: Deploy to staging, test internally
2. **Day 1**: Enable for 10% of users via feature flag
3. **Day 2-3**: Monitor metrics, if stable increase to 50%
4. **Day 4-5**: Increase to 100%
5. **Day 6+**: Remove feature flag, make permanent

**Validation**:
- [ ] Feature flags configured in PostHog
- [ ] Canary rollout plan documented
- [ ] Rollback procedure tested
- [ ] Monitoring alerts configured

**Effort**: 4 days
**Priority**: 🟡 P2

---

### 🎨 Priority 7: User Experience & Accessibility

#### GAP-018: No Mobile-Responsive Design

**Current State**: UI optimized for desktop only

**Risk Level**: 🟡 **Medium** - Poor UX on mobile devices, clinicians use tablets/phones

**Implementation**:

**Responsive Breakpoints**:

```typescript
// tailwind.config.js
export default {
  theme: {
    screens: {
      'sm': '640px',    // Mobile landscape
      'md': '768px',    // Tablets
      'lg': '1024px',   // Small desktops
      'xl': '1280px',   // Large desktops
      '2xl': '1536px',  // Extra large
    },
  },
};
```

**Responsive PatientBanner**:

```typescript
// src/components/patient/patient-banner.tsx
export function PatientBanner({ patient }: { patient: Patient }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">Name</span>
        <span className="text-lg font-semibold">{formatPatientName(patient)}</span>
      </div>
      {/* Mobile: Stack vertically, Desktop: 4 columns */}
    </div>
  );
}
```

**Mobile Testing**:

```typescript
// tests/e2e/mobile.spec.ts
import { test, expect, devices } from '@playwright/test';

test.use({ ...devices['iPhone 13'] });

test('should display correctly on mobile', async ({ page }) => {
  await page.goto('http://localhost:3000/patient');
  await expect(page.locator('h2:has-text("Patient")')).toBeVisible();
});
```

**Validation**:
- [ ] All pages responsive on mobile (375px)
- [ ] All pages responsive on tablet (768px)
- [ ] Touch targets > 44x44px (WCAG guideline)
- [ ] Mobile E2E tests pass

**Effort**: 6 days
**Priority**: 🟡 P2

---

#### GAP-019: No Internationalization (i18n)

**Current State**: English only

**Risk Level**: 🟢 **Low** - Limits adoption in non-English markets

**Implementation** (Future Enhancement):

```bash
bun add next-intl
```

```typescript
// src/i18n/en.json
{
  "patient": {
    "banner": {
      "name": "Name",
      "gender": "Gender",
      "birthDate": "Date of Birth"
    },
    "tabs": {
      "overview": "Overview",
      "dataViewer": "Data Viewer"
    }
  }
}
```

**Effort**: 10 days
**Priority**: 🟢 P3 (Future)

---

### 📚 Priority 8: Documentation & Training

#### GAP-020: No User Documentation

**Current State**: No user guides, help articles, or video tutorials

**Risk Level**: 🟠 **High** - Poor onboarding, support burden, low adoption

**Implementation**:

**Documentation Structure**:

```
docs/
├── user-guide/
│   ├── getting-started.md
│   ├── signing-in.md
│   ├── launching-from-ehr.md
│   ├── viewing-patient-data.md
│   └── troubleshooting.md
├── admin-guide/
│   ├── user-management.md
│   ├── role-configuration.md
│   └── audit-logs.md
└── developer-guide/
    ├── architecture.md (ADR)
    ├── api-reference.md
    └── deployment.md
```

**In-App Help**:

```typescript
// src/components/help-tooltip.tsx
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

export function HelpTooltip({ content }: { content: string }) {
  return (
    <Tooltip>
      <TooltipTrigger>
        <HelpCircle className="h-4 w-4 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
}
```

**Video Tutorials** (Using Loom):

1. "Getting Started with [App Name]" (5 minutes)
2. "Launching from Epic EHR" (3 minutes)
3. "Viewing Patient Data" (7 minutes)
4. "Troubleshooting Common Issues" (5 minutes)

**Validation**:
- [ ] User guide completed
- [ ] Admin guide completed
- [ ] Developer guide completed
- [ ] In-app help tooltips added
- [ ] Video tutorials published

**Effort**: 10 days
**Priority**: 🟠 P1

---

### 🚨 Priority 0: Multi-Vendor Launch Readiness (BLOCKING)

#### GAP-021: Multi-Vendor Launch Checklist & Pre-Launch Validation

**Current State**: Application supports read-only SMART launch, no multi-vendor write operations

**Risk Level**: 🔴 **Critical** - Cannot launch to Epic, Cerner, Athena without these

**⚠️ BLOCKING ITEMS for Multi-Vendor Production Launch**:

This gap aggregates all critical pre-launch requirements for deploying the multi-vendor EHR integration (Epic, Cerner, Athena) with bi-directional write operations as defined in `multi-vendor-ehr-integration-prp.md`.

**Phase 1: Vendor Adapter Implementation (Must Complete Before Write Operations)**:

```typescript
// 1. Vendor Detection
✅ src/lib/vendor-detection.ts
  - [ ] detectVendor() correctly identifies Epic/Cerner/Athena from ISS URL
  - [ ] getVendorAdapter() returns correct adapter instance
  - [ ] Unit tests cover all vendor URL patterns

// 2. Vendor Adapters
✅ src/lib/vendors/base-adapter.ts
✅ src/lib/vendors/epic-adapter.ts
✅ src/lib/vendors/cerner-adapter.ts
✅ src/lib/vendors/athena-adapter.ts
  - [ ] EpicAdapter formats scopes to .rs (patient/Observation.rs)
  - [ ] CernerAdapter keeps .read scopes (patient/Observation.read)
  - [ ] AthenaAdapter handles practice ID extraction
  - [ ] All adapters implement VendorAdapter interface
  - [ ] Vendor-specific error handling implemented

// 3. Enhanced SMART Auth
✅ src/lib/smart-auth.ts (ENHANCE EXISTING)
  - [ ] initializeSmartAuth() uses vendor adapters
  - [ ] Vendor type stored in OAuth state
  - [ ] Scopes formatted per vendor before authorization
  - [ ] Token metadata includes vendor information
```

**Phase 2: Write Operations Implementation (Must Complete Before Production)**:

```typescript
// 4. FHIR Write Utilities
✅ src/lib/fhir-write.ts (NEW FILE)
  - [ ] createFhirResource() implemented with audit logging
  - [ ] updateFhirResource() implemented with version conflict handling
  - [ ] Write operations include vendor in audit logs
  - [ ] OperationOutcome errors parsed correctly
  - [ ] Optimistic locking implemented (If-Match header)

// 5. React Hooks for Writes
✅ src/hooks/use-fhir-mutation.ts (NEW FILE)
  - [ ] useCreateFhirResource() hook implemented
  - [ ] useUpdateFhirResource() hook implemented
  - [ ] React Query invalidation after successful write
  - [ ] Error handling for write failures
  - [ ] Permission checks before mutation

// 6. Write UI Components
✅ src/components/patient/note-editor.tsx (NEW FILE)
  - [ ] Note editor form with validation
  - [ ] FHIR DocumentReference builder
  - [ ] Success/error feedback to user
  - [ ] Disabled state when user lacks write permissions
```

**Phase 3: Security & Compliance (BLOCKING PRODUCTION)**:

```typescript
// 7. Audit Logging (GAP-001 Extended)
✅ src/lib/audit-logger.ts
  - [ ] All READ operations logged with vendor
  - [ ] All WRITE operations logged with vendor
  - [ ] Success/failure tracked in logs
  - [ ] Write operation type tracked (create vs update)
  - [ ] HTTP status codes logged
  - [ ] Error messages logged (without PHI)
  - [ ] Axiom queries created for write operation monitoring

// 8. Vendor-Specific Monitoring (GAP-009 Extended)
✅ Axiom Dashboards & Alerts
  - [ ] Epic launch success rate alert configured
  - [ ] Cerner launch success rate alert configured
  - [ ] Athena launch success rate alert configured
  - [ ] Write operation failure alerts (per vendor)
  - [ ] API latency alerts (per vendor)
  - [ ] Token refresh failure alerts (per vendor)

// 9. Business Associate Agreements (GAP-005 Extended)
✅ Legal Documentation
  - [ ] BAA signed with hosting provider (covers all subdomains)
  - [ ] BAA signed with Axiom (audit logging)
  - [ ] BAA signed with Upstash (caching/rate limiting)
  - [ ] BAA renewal dates tracked
  - [ ] Legal review completed for multi-vendor deployment
```

**Phase 4: Testing & Validation (BLOCKING PRODUCTION)**:

```typescript
// 10. Vendor-Specific E2E Tests (GAP-013 Extended)
✅ tests/e2e/epic-launch.spec.ts (NEW FILE)
✅ tests/e2e/cerner-launch.spec.ts (NEW FILE)
✅ tests/e2e/athena-launch.spec.ts (NEW FILE)
✅ tests/e2e/fhir-write.spec.ts (NEW FILE)
  - [ ] Epic launch test passes (verifies .rs scopes)
  - [ ] Cerner launch test passes (verifies .read scopes)
  - [ ] Athena launch test passes (verifies practice ID)
  - [ ] Write operations E2E test passes
  - [ ] FHIR validation test passes
  - [ ] Permission denied scenario tested
  - [ ] Version conflict (409) scenario tested

// 11. Vendor Sandbox Testing
✅ Manual QA Checklist
  - [ ] Epic sandbox: Complete launch flow
  - [ ] Epic sandbox: Create DocumentReference
  - [ ] Epic sandbox: Verify note appears in chart
  - [ ] Cerner sandbox: Complete launch flow
  - [ ] Cerner sandbox: Create DocumentReference
  - [ ] Cerner sandbox: Verify note appears in chart
  - [ ] Athena sandbox: Complete launch flow (if access granted)
  - [ ] Athena sandbox: Create DocumentReference
  - [ ] Athena sandbox: Verify note appears in chart
```

**Phase 5: Deployment & Configuration (BLOCKING PRODUCTION)**:

```typescript
// 12. Vendor-Specific Configurations
✅ src/config/config.epic.prod.json (EXISTS - UPDATE)
✅ src/config/config.cerner.prod.json (EXISTS - UPDATE)
✅ src/config/config.athena.prod.json (NEW FILE)
  - [ ] Epic config includes write scopes (.ws)
  - [ ] Cerner config includes write scopes (.write)
  - [ ] Athena config created with write scopes
  - [ ] All configs have correct CLIENT_IDs for production

// 13. Multi-Vendor Deployment Strategy
✅ Subdomain Deployment
  - [ ] epic.yourdomain.com deployed with Epic config
  - [ ] cerner.yourdomain.com deployed with Cerner config
  - [ ] athena.yourdomain.com deployed with Athena config
  - [ ] SSL/TLS certificates valid for all subdomains
  - [ ] DNS configured for all subdomains
  - [ ] Monitoring configured for all subdomains

// 14. Feature Flags for Gradual Rollout
✅ PostHog Feature Flags
  - [ ] "enable_fhir_writes_epic" flag created (10% → 50% → 100%)
  - [ ] "enable_fhir_writes_cerner" flag created
  - [ ] "enable_fhir_writes_athena" flag created
  - [ ] Rollout plan documented
  - [ ] Rollback procedure tested
```

**Phase 6: Vendor Certification (PARALLEL, LONG-RUNNING)**:

```typescript
// 15. Epic App Orchard (8-12 weeks)
✅ App Registration & Certification
  - [ ] App registered at apporchard.epic.com
  - [ ] CLIENT_ID configured for production
  - [ ] Security questionnaire submitted
  - [ ] Sandbox testing completed
  - [ ] Performance benchmarks met (<2s load time)
  - [ ] Security review approved
  - [ ] Production deployment approved

// 16. Cerner Code Console (4-6 weeks)
✅ App Registration & Certification
  - [ ] App registered at code-console.cerner.com
  - [ ] CLIENT_ID configured for production
  - [ ] Sandbox testing completed
  - [ ] Production review submitted
  - [ ] Oracle Health approval received

// 17. Athena Marketplace (6-8 weeks)
✅ App Registration & Certification
  - [ ] Developer account created
  - [ ] Sandbox access granted
  - [ ] Testing completed
  - [ ] Marketplace submission approved
```

**Critical Pre-Launch Validation Gates**:

**Gate 1: Vendor Adapters Functional (Week 4)**
- [ ] All 3 vendor adapters pass unit tests
- [ ] Scope formatting verified per vendor
- [ ] SMART launch succeeds for all 3 vendors in sandbox

**Gate 2: Write Operations Functional (Week 8)**
- [ ] Write operations work in all 3 sandboxes
- [ ] Audit logging captures all write operations
- [ ] FHIR validation catches invalid resources
- [ ] Version conflicts handled gracefully

**Gate 3: Security & Compliance (Week 10)**
- [ ] All GAP-001 (audit logging) requirements met
- [ ] All GAP-005 (BAA) agreements signed
- [ ] All GAP-009 (monitoring) alerts configured
- [ ] Penetration test passed (no critical findings)

**Gate 4: E2E Tests Passing (Week 12)**
- [ ] All vendor-specific E2E tests pass
- [ ] All write operation E2E tests pass
- [ ] CI/CD pipeline running all tests
- [ ] Test coverage > 80%

**Gate 5: Vendor Certification (Week 24)**
- [ ] Epic production approval received
- [ ] Cerner production approval received
- [ ] Athena production approval received (if applicable)

**Total Estimated Timeline**: 24 weeks (6 months)

**Validation Commands**:

```bash
# Run all vendor-specific tests
npx playwright test tests/e2e/epic-launch.spec.ts
npx playwright test tests/e2e/cerner-launch.spec.ts
npx playwright test tests/e2e/athena-launch.spec.ts
npx playwright test tests/e2e/fhir-write.spec.ts

# Verify vendor detection
bun test src/lib/vendors/

# Type check
bun run type-check

# Lint
bun run lint

# Build all vendor configurations
bun run build:epic
bun run build:cerner
bun run build:athena
```

**Effort**: 60-80 days engineering + 16 weeks vendor certification (parallel)
**Priority**: 🔴 P0 (BLOCKING MULTI-VENDOR PRODUCTION LAUNCH)

---

## Epic/Cerner/Athena Vendor-Specific Requirements

### Epic App Orchard Certification Requirements

| Requirement | Status | Action Required |
|-------------|--------|-----------------|
| **App Registration** | ❌ Not Started | Register at apporchard.epic.com |
| **SMART Launch Support** | ✅ Implemented | None |
| **Patient Banner** | ✅ Implemented | None |
| **Refresh Token Support** | ✅ Implemented | None |
| **Security Review** | ❌ Not Started | Submit app for Epic security review |
| **FHIR R4 Compliance** | ✅ Implemented | None |
| **Error Handling** | ⚠️ Partial | Improve error messages, add retry logic |
| **Performance (< 2s load)** | ⚠️ Unknown | Run load tests, optimize |
| **Sandbox Testing** | ❌ Not Started | Test on Epic sandbox environment |
| **Production Approval** | ❌ Not Started | Submit for Epic production review |

**Timeline**: 8-12 weeks (Epic review process is slow)

---

### Cerner Code Console Requirements

| Requirement | Status | Action Required |
|-------------|--------|-----------------|
| **App Registration** | ❌ Not Started | Register at code-console.cerner.com |
| **FHIR R4 Support** | ✅ Implemented | None |
| **OAuth 2.0 + PKCE** | ✅ Implemented | None |
| **Refresh Token** | ✅ Implemented | None |
| **Sandbox Testing** | ❌ Not Started | Test on Cerner sandbox |
| **Production Approval** | ❌ Not Started | Submit for Oracle Health review |

**Timeline**: 4-6 weeks

---

### Athena Health Marketplace Requirements

| Requirement | Status | Action Required |
|-------------|--------|-----------------|
| **Developer Account** | ❌ Not Started | Create account at developer.athenahealth.com |
| **FHIR API Integration** | ✅ Implemented | None |
| **OAuth 2.0** | ✅ Implemented | None |
| **Sandbox Testing** | ❌ Not Started | Contact Athena for sandbox access |
| **Production Approval** | ❌ Not Started | Submit for Athena review |

**Timeline**: 6-8 weeks

---

## Implementation Roadmap

### Phase 1: Multi-Vendor Infrastructure & Security (6-8 weeks)

**⚠️ UPDATED for Multi-Vendor Launch**:

**Must-Fix (Blocking Production)**:
- ✅ ADR Documentation
- [ ] GAP-021: Multi-Vendor Launch Checklist - Phase 1 (Vendor Adapters) (10 days)
- [ ] GAP-001: Audit Logging with Vendor Tracking (3 days + 2 days write ops)
- [ ] GAP-002: Encryption at Rest (5 days)
- [ ] GAP-003: Rate Limiting (2 days)
- [ ] GAP-004: Content Security Policy (2 days)
- [ ] GAP-005: Business Associate Agreement - Multi-Vendor (4 weeks legal process)
- [ ] GAP-013: E2E Tests - Vendor-Specific (8 days + 6 days vendor-specific)

**Total Effort**: 38 days engineering + 4 weeks BAA (parallel)

---

### Phase 2: Write Operations & Observability (4-5 weeks)

**⚠️ UPDATED for Multi-Vendor Launch**:

- [ ] GAP-021: Multi-Vendor Launch Checklist - Phase 2 (Write Operations) (12 days)
- [ ] GAP-009: Production Monitoring with Vendor Metrics (4 days + 2 days vendor-specific)
- [ ] GAP-010: User Analytics (3 days)
- [ ] GAP-011: Load Testing (5 days)
- [ ] GAP-014: Component Tests (6 days)
- [ ] GAP-015: Accessibility Testing (4 days)

**Total Effort**: 36 days

---

### Phase 3: Multi-Vendor Deployment & Feature Flags (3-4 weeks)

**⚠️ UPDATED for Multi-Vendor Launch**:

- [ ] GAP-021: Multi-Vendor Launch Checklist - Phase 3 (Deployment) (8 days)
- [ ] GAP-016: CI/CD Pipeline (3 days)
- [ ] GAP-017: Canary Rollout with Vendor-Specific Flags (4 days)
- [ ] GAP-020: User Documentation (10 days)
- [ ] Multi-vendor subdomain deployment (epic/cerner/athena subdomains) (3 days)
- [ ] Feature flag configuration per vendor (2 days)

**Total Effort**: 30 days

---

### Phase 4: Vendor Certification (12-16 weeks, PARALLEL)

**⚠️ CRITICAL for Multi-Vendor Launch**:

These certification processes run in parallel and are MANDATORY for production launch to each vendor.

**Epic** (8-12 weeks):
- [ ] GAP-021: Multi-Vendor Launch Checklist - Phase 6 (Epic Certification)
- [ ] Register app on App Orchard
- [ ] Configure write scopes (.ws for DocumentReference)
- [ ] Complete sandbox testing with write operations
- [ ] Submit security questionnaire
- [ ] Performance benchmarks (<2s load time)
- [ ] Wait for Epic security review (6-8 weeks)
- [ ] Get production approval

**Cerner** (4-6 weeks):
- [ ] GAP-021: Multi-Vendor Launch Checklist - Phase 6 (Cerner Certification)
- [ ] Register on Code Console
- [ ] Configure write scopes (.write for DocumentReference)
- [ ] Test on Cerner sandbox with write operations
- [ ] Submit for production review (4-6 weeks)
- [ ] Get Oracle Health approval

**Athena** (6-8 weeks):
- [ ] GAP-021: Multi-Vendor Launch Checklist - Phase 6 (Athena Certification)
- [ ] Contact Athena developer relations
- [ ] Get sandbox access
- [ ] Configure write scopes
- [ ] Complete testing with write operations
- [ ] Submit for review (6-8 weeks)
- [ ] Get marketplace approval

**Total Timeline**: 12-16 weeks (parallel processes)

---

### Phase 5: Enhanced Features (Ongoing)

- [ ] GAP-006: RBAC (5 days)
- [ ] GAP-007: SSO Support (10 days)
- [ ] GAP-008: Auto Token Refresh (2 days)
- [ ] GAP-012: Caching Strategy (3 days)
- [ ] GAP-018: Mobile Responsive (6 days)

---

## Validation Gates

### Gate 1: Security Audit ✅

**Criteria**:
- [ ] All Critical (P0) gaps resolved
- [ ] Penetration test completed (no critical findings)
- [ ] HIPAA compliance checklist 100% complete
- [ ] BAA signed with all third-party services

**Sign-off**: Security Lead + Legal

---

### Gate 2: Performance Benchmark ✅

**Criteria**:
- [ ] Load tests pass (100 concurrent users)
- [ ] P95 response time < 2 seconds
- [ ] Time to Interactive < 5 seconds
- [ ] Lighthouse score > 90

**Sign-off**: Engineering Lead

---

### Gate 3: Epic/Cerner/Athena Certification ✅

**Criteria**:
- [ ] Epic App Orchard production approval
- [ ] Cerner Code Console production approval
- [ ] Athena Marketplace approval

**Sign-off**: Product Manager

---

### Gate 4: Production Readiness Review ✅

**Criteria**:
- [ ] All P0 and P1 gaps resolved
- [ ] E2E tests passing
- [ ] Monitoring dashboards live
- [ ] Incident response plan documented
- [ ] User documentation published

**Sign-off**: CTO/VP Engineering

---

## Risk Mitigation

### Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Epic rejects app** | Medium | Critical | Engage Epic early, follow best practices, hire consultant |
| **HIPAA audit failure** | Low | Critical | Complete GAP-001, GAP-002, hire HIPAA consultant |
| **Production outage** | Medium | High | Implement GAP-009, GAP-016 (monitoring + CI/CD) |
| **Token theft (XSS)** | Low | High | Implement GAP-004 (CSP), migrate to httpOnly cookies |
| **Performance issues** | Medium | Medium | Complete GAP-011, GAP-012 (load testing + caching) |

---

## Cost Estimates

### Infrastructure (Monthly)

| Service | Cost | Purpose |
|---------|------|---------|
| **Vercel Pro** | $20/month | Hosting (staging + production) |
| **Upstash Redis** | $10/month | Rate limiting + caching |
| **Axiom** | $25/month | Logging + monitoring |
| **PostHog** | $0 (free tier) | Analytics + feature flags |
| **GitHub Actions** | $0 (free tier) | CI/CD |

**Total**: ~$55/month

### One-Time Costs

| Item | Cost | Purpose |
|------|------|---------|
| **Epic App Orchard Fee** | $0 (free) | Epic registration |
| **Cerner Registration** | $0 (free) | Cerner registration |
| **HIPAA Compliance Audit** | $5,000-$10,000 | Third-party audit |
| **Penetration Testing** | $3,000-$7,000 | Security testing |
| **Legal (BAA Review)** | $2,000-$5,000 | Contract review |

**Total**: ~$10,000-$22,000

---

## Success Metrics

### Technical Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Uptime** | 99.9% | Axiom monitoring |
| **P95 API Response Time** | < 2s | Axiom APM |
| **Error Rate** | < 0.1% | Axiom logs |
| **Test Coverage** | > 80% | Vitest + Codecov |
| **Security Vulnerabilities** | 0 critical | Penetration test |

### Business Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Epic Certification** | Approved | App Orchard status |
| **Cerner Certification** | Approved | Code Console status |
| **Athena Certification** | Approved | Marketplace status |
| **User Adoption (30 days)** | 100+ active users | PostHog |
| **SMART Launch Success Rate** | > 95% | PostHog events |

---

## References

### Healthcare Compliance

- [HIPAA Security Rule](https://www.hhs.gov/hipaa/for-professionals/security/)
- [HITECH Act](https://www.hhs.gov/hipaa/for-professionals/special-topics/hitech-act-enforcement-interim-final-rule/)
- [ONC Cures Act Final Rule](https://www.healthit.gov/curesrule/)

### EHR Vendor Documentation

- [Epic App Orchard](https://apporchard.epic.com/)
- [Epic FHIR Documentation](https://fhir.epic.com/)
- [Cerner Code Console](https://code-console.cerner.com/)
- [Oracle Health FHIR APIs](https://docs.oracle.com/en/industries/health/millennium-platform-apis/)
- [Athena Health Developer Portal](https://developer.athenahealth.com/)

### SMART on FHIR

- [SMART App Launch Specification](https://build.fhir.org/ig/HL7/smart-app-launch/)
- [SMART on FHIR Best Practices](https://build.fhir.org/ig/HL7/smart-app-launch/best-practices.html)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)

---

## Document Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-20 | AI Agent | Initial gap analysis and roadmap |

---

**Document Status**: ✅ Complete (UPDATED for Multi-Vendor Launch)

**Last Updated**: 2025-01-20 (Multi-vendor integration requirements added)

**Next Review Date**: Monthly until production launch

**Approved By**: [Pending Engineering Lead Review]

---

**⚠️ CRITICAL UPDATES for Multi-Vendor Launch**:

**Total Estimated Effort**: 104 days engineering + 16 weeks vendor certification (parallel)

**Breakdown**:
- Phase 1 (Infrastructure & Security): 38 days
- Phase 2 (Write Operations & Observability): 36 days  
- Phase 3 (Deployment & Feature Flags): 30 days
- Phase 4 (Vendor Certification): 12-16 weeks (parallel, not additive)

**Recommended Team Size**: 3-4 engineers (1 senior lead, 2 mid-level, 1 junior)

**Target Production Launch**: Q3 2025 (6 months from start, assuming immediate start and parallel vendor certification)

**BLOCKING DEPENDENCIES for Multi-Vendor Launch**:
1. GAP-021: All 6 phases of multi-vendor launch checklist
2. GAP-001: Audit logging with vendor tracking and write operations
3. GAP-005: BAA agreements covering all subdomains and services
4. GAP-013: Vendor-specific E2E tests (Epic, Cerner, Athena)
5. Epic, Cerner, Athena production approvals

**Next Steps**:
1. Review multi-vendor-ehr-integration-prp.md with product/engineering leads
2. Begin Phase 1: Vendor adapter implementation (Week 1-4)
3. Start vendor certification processes early (parallel with development)
4. Resolve blocking dependencies (audit logging, BAA, E2E tests)
5. Set up vendor-specific sandboxes for testing

**Reference Documents**:
- `docs/PRPs/multi-vendor-ehr-integration-prp.md` - Multi-vendor implementation guide
- `docs/PRPs/adr-smart-on-fhir-architecture.md` - Architecture decisions
- `docs/PRPs/EXECUTIVE_SUMMARY.md` - Executive overview

