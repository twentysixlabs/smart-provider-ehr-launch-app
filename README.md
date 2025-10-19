# SMART on FHIR Provider EHR Launch App

A modern, production-ready SMART on FHIR application built with Next.js 15, React 19, TypeScript, and TailwindCSS 4. This provider-facing application enables clinicians to launch directly from their EHR and seamlessly access clinical data while integrating with your services.

## 🚀 Features

- **Next.js 15** with App Router and React Server Components
- **React 19** with latest features  
- **TypeScript** with strict type checking (no `any` types)
- **TailwindCSS 4** for styling
- **Shadcn UI** for accessible, composable components
- **Motion** (motion/react) for smooth animations
- **Zustand** for state management
- **React Query** for data fetching
- **Zod** for schema validation
- **React Hook Form** for form handling
- **@medplum/fhirtypes** for comprehensive FHIR R4 types
- **Dark/Light mode** support with next-themes
- **Bun** as package manager for fast installs
- **Biome** for lightning-fast linting and formatting
- **Comprehensive test coverage** with Vitest
- **WCAG accessibility** compliance
- **Standalone build output** for easy deployment

## 🏥 Provider-Facing Application

This app is designed for **clinicians** (doctors, nurses, medical staff) who need to:

- **Launch from within their EHR** - Seamless integration with Epic, Cerner, and Athena
- **Access patient data** - View demographics, vitals, labs, medications, conditions, and more
- **Integrate with your services** - Connect to your backend APIs while maintaining EHR context
- **Work securely** - OAuth 2.0 with PKCE, token management, and refresh capabilities

### SMART on FHIR Flow

1. **EHR Launch**: Clinician clicks your app in their EHR
2. **Authorization**: App requests necessary scopes and authorizes
3. **Patient Context**: Receives current patient and encounter context
4. **Data Access**: Makes authenticated FHIR API calls
5. **Your Services**: Integrate your own services with patient context

## 📋 Prerequisites

- **Bun** >= 1.3.0 (recommended package manager)
- **Node.js** >= 22.0.0 (fallback)
- Access to a SMART on FHIR server (SMART Launcher, Epic sandbox, or Cerner sandbox)

## 🛠️ Installation

```bash
# Install bun if you haven't already
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run development server
bun dev

# Build for production
bun run build

# Start production server
bun start
```

## ⚙️ Configuration

### 1. Application Configuration

Edit `src/config/config.json`:

```json
{
  "CLIENT_ID": "your-client-id",
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

### 2. EHR-Specific Configurations

For production builds targeting specific EHR systems:

- **Epic**: `src/config/config.epic.prod.json`
- **Cerner**: `src/config/config.cerner.prod.json`

### 3. Environment-Specific Builds

```bash
# Build for Epic
bun run build:epic

# Build for Cerner
bun run build:cerner
```

## 🧪 Testing

This project includes comprehensive test coverage with:

- **Unit tests** for utilities and stores
- **Component tests** with React Testing Library
- **Integration tests** for FHIR workflows
- **Coverage reports** with c8

```bash
# Run all tests
bun test

# Run tests in watch mode
bun run test:ui

# Generate coverage report
bun run test:coverage
```

## 🌐 Testing with SMART App Launcher

1. Visit [SMART App Launcher](https://launch.smarthealthit.org)
2. Select a patient and practitioner
3. Enter launch URL: `http://localhost:3000/auth/smart/login`
4. Click "Launch"

## 📦 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel --prod
```

Or use the Vercel GitHub integration for automatic deployments.

### Cloudflare Pages

```bash
# Build the application
bun run build

# Deploy to Cloudflare Pages
# Use .next/standalone as the output directory
```

Configuration in your Cloudflare Pages project:
- **Build command**: `bun run build`
- **Output directory**: `.next/standalone`
- **Node.js version**: 22

## 🎨 Development

### Code Quality

```bash
# Run linter
bun run lint

# Fix linting issues
bun run lint:fix

# Format code
bun run format

# Type check
bun run type-check
```

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── patient/           # Patient data pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── patient/          # Patient-specific components
│   ├── ui/               # Shadcn UI components
│   └── providers.tsx     # App providers
├── config/               # Configuration files
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── fhir-utils.ts    # FHIR helper functions
│   ├── pkce.ts          # PKCE implementation
│   ├── smart-auth.ts    # SMART auth logic
│   └── utils.ts         # General utilities
├── stores/              # Zustand stores
│   ├── token-store.ts   # Token state management
│   └── ui-store.ts      # UI state management
├── test/                # Test setup and utilities
└── types/               # TypeScript type definitions
    ├── fhir.ts         # Re-exports from @medplum/fhirtypes
    ├── smart.ts        # SMART auth types
    └── index.ts        # Exported types
```

## 🔒 Security Features

- **PKCE** (Proof Key for Code Exchange) for secure OAuth flow
- **Security headers** configured in Next.js
- **No secrets in client code** (public client pattern)
- **Token expiry tracking** and automatic refresh
- **XSS protection** via strict Content Security Policy
- **HTTPS-only** in production

## ♿ Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Semantic HTML
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance
- ARIA labels and roles

## 🏗️ Integrating Your Services

This app is designed to be a starting point for your provider-facing EHR integration. Here's how to add your services:

### 1. Add Your API Client

```typescript
// src/lib/your-service-client.ts
export async function callYourService(patientId: string, token: string) {
  const response = await fetch('https://your-api.com/endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Patient-ID': patientId,
    },
  });
  return response.json();
}
```

### 2. Create Custom Hooks

```typescript
// src/hooks/use-your-service.ts
import { useQuery } from '@tanstack/react-query';
import { callYourService } from '@/lib/your-service-client';

export function useYourService(patientId: string, token: string) {
  return useQuery({
    queryKey: ['your-service', patientId],
    queryFn: () => callYourService(patientId, token),
    enabled: Boolean(patientId) && Boolean(token),
  });
}
```

### 3. Use in Components

```typescript
// src/components/your-feature/your-component.tsx
'use client';

import { useYourService } from '@/hooks/use-your-service';
import { useTokenStore } from '@/stores/token-store';

export function YourComponent() {
  const token = useTokenStore((state) => state.token);
  const { data, isLoading } = useYourService(
    token?.patient ?? '',
    token?.access_token ?? ''
  );
  
  // Render your UI
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Authorization fails**
   - Verify CLIENT_ID matches your EHR registration
   - Check redirect URI matches exactly
   - Ensure scopes are supported by the EHR

2. **Token expired**
   - Use the refresh token feature
   - Check token expiry time
   - Verify refresh_token scope is requested

3. **FHIR API errors**
   - Verify access token is valid
   - Check resource permissions
   - Ensure FHIR base URL is correct

## 📚 Documentation

- [HL7 SMART App Launch](https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html) - Official specification
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Medplum FHIR Types](https://github.com/medplum/medplum) - Type definitions used
- [Epic SMART on FHIR](https://fhir.epic.com/)
- [Cerner SMART on FHIR](https://docs.oracle.com/en/industries/health/millennium-platform-apis/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)
- [Biome Documentation](https://biomejs.dev/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- HL7 SMART Health IT team for the SMART App Launch Framework
- Epic, Cerner, and Athena for their FHIR implementations
- Medplum for comprehensive FHIR type definitions
- Shadcn for the excellent UI component library
- The Next.js and React teams for amazing frameworks
- Bun and Biome teams for fast developer tools

---

**Built for clinicians, by developers who care about healthcare interoperability** ❤️
