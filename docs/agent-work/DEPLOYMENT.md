# Deployment Guide

This guide covers deployment options for the SMART on FHIR Provider EHR Launch App on Vercel and Cloudflare Pages.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Cloudflare Pages Deployment](#cloudflare-pages-deployment)
- [Environment Configuration](#environment-configuration)
- [EHR Registration](#ehr-registration)
- [Monitoring and Logging](#monitoring-and-logging)

## Prerequisites

Before deploying, ensure you have:

1. A registered SMART on FHIR application with your EHR vendor (Epic, Cerner, or Athena)
2. Your CLIENT_ID from the EHR registration
3. Configured redirect URIs in your EHR app registration
4. Appropriate scopes granted for your application
5. A Vercel or Cloudflare account

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/smart-fhir-app)

### Manual Deployment

1. **Install Vercel CLI**:
```bash
bun add -g vercel
```

2. **Build the application**:
```bash
bun run build
```

3. **Deploy to Vercel**:
```bash
vercel --prod
```

### GitHub Integration

For automatic deployments:

1. Go to [Vercel](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure build settings:
   - **Build Command**: `bun run build`
   - **Output Directory**: `.next`
   - **Install Command**: `bun install`
5. Click "Deploy"

### Vercel Configuration

Create `vercel.json` in your project root:

```json
{
  "buildCommand": "bun run build",
  "devCommand": "bun dev",
  "installCommand": "bun install",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
```

### Environment Variables

In Vercel dashboard, add:
- Update `src/config/config.json` with your production values before deploying
- Or use Vercel's environment variables feature

## Cloudflare Pages Deployment

### Using Cloudflare Pages

1. **Build the application**:
```bash
bun run build
```

2. **Create a Cloudflare Pages project**:
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
   - Navigate to Pages
   - Click "Create a project"
   - Connect your Git repository

3. **Configure build settings**:
   - **Build command**: `bun run build`
   - **Build output directory**: `.next/standalone`
   - **Root directory**: `/`
   - **Environment variables**: Add `NODE_VERSION` = `22`

### Cloudflare Configuration

Create `wrangler.toml` for Cloudflare Workers (optional):

```toml
name = "smart-fhir-app"
compatibility_date = "2024-01-01"

[site]
bucket = "./.next/standalone"

[build]
command = "bun run build"

[[routes]]
pattern = "/*"
custom_domain = true
```

### Using Cloudflare CLI

```bash
# Install Wrangler
bun add -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler pages publish .next/standalone
```

## Environment Configuration

### Production Configuration

Update `src/config/config.json` for your environment:

```json
{
  "CLIENT_ID": "your-production-client-id",
  "BASE_URL": "https://your-app.vercel.app",
  "SMART_SCOPES": [
    "launch",
    "fhirUser",
    "profile",
    "openid",
    "online_access",
    "patient/*.rs",
    "user/*.rs"
  ],
  "STORAGE_KEYS": {
    "OAUTH_STATE": "oauth2-state",
    "CODE_VERIFIER": "code-verifier",
    "TOKEN_DATA": "token-data",
    "AUTHORIZATION_URL": "authorization-url",
    "TOKEN_URL": "token-url",
    "FHIR_BASE_URL": "fhir-base-url"
  },
  "STORAGE_TYPE": "local"
}
```

### EHR-Specific Builds

#### Epic Deployment

```bash
bun run build:epic
```

This copies `src/config/config.epic.prod.json` to `src/config/config.json` before building.

#### Cerner Deployment

```bash
bun run build:cerner
```

This copies `src/config/config.cerner.prod.json` to `src/config/config.json` before building.

## EHR Registration

### Epic Registration

1. Log in to [Epic UserWeb](https://fhir.epic.com/)
2. Navigate to "Build Apps"
3. Click "Create" and select "Provider Facing App"
4. Fill in app details:
   - **App Name**: Your app name
   - **Redirect URI**: `https://your-app.vercel.app/auth/smart/callback`
   - **Launch URI**: `https://your-app.vercel.app/auth/smart/login`
   - **FHIR Version**: R4
5. Select required scopes
6. Submit for review
7. Note your CLIENT_ID once approved

### Cerner Registration

1. Log in to [Oracle Health Code Console](https://code-console.cerner.com/)
2. Click "New App"
3. Configure app:
   - **App Type**: Provider
   - **Redirect URI**: `https://your-app.vercel.app/auth/smart/callback`
   - **Launch URI**: `https://your-app.vercel.app/auth/smart/login`
   - **SMART Launch URL**: Yes
   - **FHIR Version**: R4
4. Select FHIR resources and scopes
5. Save and note your CLIENT_ID

### Athena Registration

1. Contact your Athena representative
2. Provide:
   - Application name and description
   - Redirect URI: `https://your-app.vercel.app/auth/smart/callback`
   - Launch URI: `https://your-app.vercel.app/auth/smart/login`
   - Required FHIR scopes
3. Complete Athena's onboarding process
4. Receive CLIENT_ID and configuration details

## SSL/TLS Configuration

Both Vercel and Cloudflare automatically provide SSL/TLS certificates:

### Vercel
- Automatic SSL via Let's Encrypt
- Automatically renews certificates
- No configuration needed

### Cloudflare
- Universal SSL included
- Enable "Always Use HTTPS" in SSL/TLS settings
- Set encryption mode to "Full (strict)"

## Custom Domains

### Vercel Custom Domain

1. Go to your project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Vercel handles SSL automatically

### Cloudflare Custom Domain

1. Add domain to Cloudflare
2. Update nameservers
3. In Pages project, add custom domain
4. SSL is automatically configured

## Monitoring and Logging

### Vercel Analytics

Enable Vercel Analytics for performance monitoring:

```bash
bun add @vercel/analytics
```

Add to your layout:

```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### Cloudflare Web Analytics

1. Enable Web Analytics in Cloudflare dashboard
2. Add the analytics script to your site
3. View metrics in Cloudflare dashboard

### Application Logs

Both platforms provide log access:

**Vercel**:
- View logs in project dashboard
- Use `vercel logs` CLI command

**Cloudflare**:
- View logs in Pages dashboard
- Use Logpush for advanced logging

## Performance Optimization

### Vercel Edge Functions

Convert certain API routes to Edge Functions for better performance:

```typescript
// src/app/api/example/route.ts
export const runtime = 'edge';

export async function GET() {
  // Your edge function code
}
```

### Cloudflare Workers

Use Cloudflare Workers for serverless functions:

```typescript
// worker.js
export default {
  async fetch(request, env) {
    // Your worker code
  }
}
```

## Rollback Strategy

### Vercel Rollback

1. Go to your project in Vercel
2. Navigate to "Deployments"
3. Find the deployment to rollback to
4. Click "..." and select "Promote to Production"

### Cloudflare Rollback

1. Go to your Pages project
2. Navigate to "Deployments"
3. Select the deployment to rollback to
4. Click "Rollback to this deployment"

## Health Checks

Add a health check endpoint:

```typescript
// src/app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
```

Monitor this endpoint from:
- Vercel: Built-in monitoring
- Cloudflare: Workers health checks
- External: UptimeRobot, Pingdom, etc.

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure redirect URI in config matches EHR registration exactly
   - Check for trailing slashes
   - Verify HTTPS is used

2. **Build Failures**
   - Check build logs in platform dashboard
   - Verify all dependencies are in package.json
   - Ensure Node version is correct (22+)

3. **Token Issues**
   - Verify CLIENT_ID is correct
   - Check that scopes are properly requested
   - Ensure BASE_URL matches your deployment URL

4. **CORS Errors**
   - Verify your domain is whitelisted with the EHR
   - Check Next.js headers configuration
   - Ensure proper CORS headers on API routes

## Security Checklist

- [ ] HTTPS enabled (automatic on both platforms)
- [ ] Security headers configured
- [ ] Client ID is correct for environment
- [ ] Redirect URIs match exactly
- [ ] No sensitive data in client code
- [ ] CORS properly configured
- [ ] Error logging configured
- [ ] Health check endpoint added

## Cost Optimization

### Vercel
- Use hobby plan for development
- Pro plan for production
- Monitor bandwidth usage
- Use edge functions where appropriate

### Cloudflare
- Free tier available for small apps
- Pay-as-you-go for larger apps
- Unlimited bandwidth included
- Workers requests metered

## Support

For deployment issues:
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **Cloudflare**: [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- **SMART on FHIR**: [HL7 Specification](https://build.fhir.org/ig/HL7/smart-app-launch/)
- **EHR-specific**: Contact your EHR representative

---

**Both Vercel and Cloudflare provide excellent platforms for deploying Next.js applications with SMART on FHIR integration!**
