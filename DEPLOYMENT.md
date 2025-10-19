# Deployment Guide

This guide covers various deployment options for the SMART on FHIR Provider EHR Launch App.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Docker Deployment](#docker-deployment)
- [Traditional Server Deployment](#traditional-server-deployment)
- [Environment Configuration](#environment-configuration)
- [EHR Registration](#ehr-registration)

## Prerequisites

Before deploying, ensure you have:

1. A registered SMART on FHIR application with your EHR vendor (Epic, Cerner, or Athena)
2. Your CLIENT_ID from the EHR registration
3. Configured redirect URIs in your EHR app registration
4. Appropriate scopes granted for your application

## Vercel Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-repo/smart-fhir-app)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to Vercel:
```bash
vercel --prod
```

3. Configure environment:
   - Update `src/config/config.json` with your production CLIENT_ID and BASE_URL
   - Ensure BASE_URL matches your Vercel domain

## Docker Deployment

### Build Docker Image

```bash
docker build -t smart-fhir-app .
```

### Run Container

```bash
docker run -p 3000:3000 smart-fhir-app
```

### Docker Compose

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Run with:
```bash
docker-compose up -d
```

## Traditional Server Deployment

### Build for Production

```bash
npm run build
```

### Run Standalone Server

```bash
cd .next/standalone
node server.js
```

### Using PM2

```bash
npm install -g pm2
pm2 start .next/standalone/server.js --name smart-fhir-app
pm2 save
pm2 startup
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Configuration

### Production Configuration

Update `src/config/config.json` for production:

```json
{
  "CLIENT_ID": "your-production-client-id",
  "BASE_URL": "https://your-domain.com",
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
npm run build:epic
```

This copies `src/config/config.epic.prod.json` to `src/config/config.json` before building.

#### Cerner Deployment

```bash
npm run build:cerner
```

This copies `src/config/config.cerner.prod.json` to `src/config/config.json` before building.

## EHR Registration

### Epic Registration

1. Log in to [Epic UserWeb](https://fhir.epic.com/)
2. Navigate to "Build Apps"
3. Click "Create" and select "Provider Facing App"
4. Fill in app details:
   - **App Name**: Your app name
   - **Redirect URI**: `https://your-domain.com/auth/smart/callback`
   - **Launch URI**: `https://your-domain.com/auth/smart/login`
5. Select required scopes
6. Submit for review
7. Note your CLIENT_ID once approved

### Cerner Registration

1. Log in to [Oracle Health Code Console](https://code-console.cerner.com/)
2. Click "New App"
3. Configure app:
   - **App Type**: Provider
   - **Redirect URI**: `https://your-domain.com/auth/smart/callback`
   - **Launch URI**: `https://your-domain.com/auth/smart/login`
   - **SMART Launch URL**: Yes
4. Select FHIR resources and scopes
5. Save and note your CLIENT_ID

### Athena Registration

1. Contact your Athena representative
2. Provide:
   - Application name and description
   - Redirect URI: `https://your-domain.com/auth/smart/callback`
   - Launch URI: `https://your-domain.com/auth/smart/login`
   - Required FHIR scopes
3. Complete Athena's onboarding process
4. Receive CLIENT_ID and configuration details

## SSL/TLS Configuration

### Let's Encrypt with Certbot

```bash
sudo certbot --nginx -d your-domain.com
```

### Cloudflare

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Always Use HTTPS" in SSL/TLS settings
4. Set SSL/TLS encryption mode to "Full (strict)"

## Monitoring and Logging

### Application Logs

With PM2:
```bash
pm2 logs smart-fhir-app
```

With Docker:
```bash
docker logs -f smart-fhir-app
```

### Health Checks

Add a health check endpoint by creating `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

## Troubleshooting

### Common Issues

1. **Redirect URI Mismatch**
   - Ensure redirect URI in config matches EHR registration exactly
   - Check for trailing slashes

2. **CORS Errors**
   - Verify your domain is whitelisted with the EHR
   - Check Next.js headers configuration

3. **Token Issues**
   - Verify CLIENT_ID is correct
   - Check that scopes are properly requested
   - Ensure BASE_URL matches your deployment URL

### Debug Mode

Enable detailed logging by setting in your environment:

```bash
export NODE_ENV=development
export NEXT_PUBLIC_DEBUG=true
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Client ID is correct for environment
- [ ] Redirect URIs match exactly
- [ ] No sensitive data in client code
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Error logging configured

## Performance Optimization

### CDN Configuration

Use a CDN for static assets:

1. Configure in `next.config.ts`:
```typescript
const nextConfig = {
  assetPrefix: 'https://cdn.your-domain.com',
}
```

2. Upload `.next/static` to your CDN

### Database Caching (if needed)

Consider adding Redis for session caching:

```bash
npm install ioredis
```

## Rollback Strategy

### Keep Previous Build

```bash
# Before deploying
mv .next .next.backup

# To rollback
rm -rf .next
mv .next.backup .next
pm2 restart smart-fhir-app
```

### Git Tags

```bash
# Tag releases
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0

# Rollback
git checkout v1.0.0
npm run build
pm2 restart smart-fhir-app
```

## Scaling

### Horizontal Scaling

Use a load balancer with multiple instances:

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    deploy:
      replicas: 3
    ports:
      - "3000-3002:3000"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### Auto-scaling on Cloud Platforms

#### AWS ECS
- Use Fargate with auto-scaling policies
- Configure target tracking based on CPU/memory

#### Google Cloud Run
- Automatically scales based on traffic
- Set min/max instances

#### Azure Container Apps
- Configure scaling rules
- Set replica counts

## Support

For deployment issues:
- Check [GitHub Issues](https://github.com/your-repo/issues)
- Review EHR-specific documentation
- Contact your EHR representative for integration issues
