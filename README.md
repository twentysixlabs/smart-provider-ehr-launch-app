# SMART on FHIR Provider EHR Launch App - Next.js 15

A modern, production-ready SMART on FHIR application built with Next.js 15, React 19, TypeScript, and TailwindCSS 4. This application demonstrates the EHR launch flow for provider-facing clinical applications with support for Epic, Cerner, and Athena EHR systems.

## 🚀 Features

- **Next.js 15** with App Router and React Server Components
- **React 19** with latest features
- **TypeScript** with strict type checking (no `any` types)
- **TailwindCSS 4** for styling
- **Shadcn UI** for accessible, composable components
- **Framer Motion** for smooth animations
- **Zustand** for state management
- **React Query** for data fetching
- **Zod** for schema validation
- **React Hook Form** for form handling
- **Dark/Light mode** support with next-themes
- **Comprehensive test coverage** with Vitest
- **WCAG accessibility** compliance
- **Standalone build output** for easy deployment

## 🏥 Healthcare Integration

This app implements the [SMART App Launch Framework](https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html) and supports:

- **Epic** - Full SMART on FHIR support
- **Cerner** - Oracle Health integration
- **Athena** - athenahealth EHR systems
- **SMART App Launcher** - Reference implementation

### SMART on FHIR Flow

1. **EHR Launch**: EHR initiates launch with `iss` and `launch` parameters
2. **Discovery**: App discovers OAuth endpoints via `.well-known/smart-configuration`
3. **Authorization**: Redirects to EHR's authorization server with PKCE
4. **Token Exchange**: Exchanges authorization code for access/refresh tokens
5. **API Access**: Makes authenticated FHIR API calls

## 📋 Prerequisites

- **Node.js** >= 22.0.0
- **npm** >= 10.0.0
- Access to a SMART on FHIR server (SMART Launcher, Epic sandbox, or Cerner sandbox)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

## ⚙️ Configuration

### 1. Application Configuration

Edit `src/config/config.json`:

```json
{
  "CLIENT_ID": "your-client-id",
  "BASE_URL": "http://localhost:3000",
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
npm run build:epic

# Build for Cerner
npm run build:cerner
```

## 🧪 Testing

This project includes comprehensive test coverage with:

- **Unit tests** for utilities and stores
- **Component tests** with React Testing Library
- **Integration tests** for FHIR workflows
- **Coverage reports** with c8

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🌐 Testing with SMART App Launcher

1. Visit [SMART App Launcher](https://launch.smarthealthit.org)
2. Select a patient and practitioner
3. Enter launch URL: `http://localhost:3000/auth/smart/login`
4. Click "Launch"

## 🏗️ Project Structure

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
    ├── fhir.ts         # FHIR resource types
    ├── smart.ts        # SMART auth types
    └── index.ts        # Exported types
```

## 🔒 Security Features

- **PKCE** (Proof Key for Code Exchange) for secure OAuth flow
- **Security headers** configured in Next.js
- **No secrets in client code** (public client pattern)
- **Token expiry tracking** and automatic refresh
- **XSS protection** via strict Content Security Policy
- **HTTPS-only** cookies in production

## ♿ Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- Semantic HTML
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliance
- ARIA labels and roles

## 🎨 Styling

- **TailwindCSS 4** with CSS layers
- **Shadcn UI** component system
- **Dark/Light mode** with system preference detection
- **Responsive design** mobile-first approach
- **No custom CSS files** - all styling via Tailwind utilities

## 📦 Build & Deployment

### Standalone Output

This project is configured for standalone output, making it easy to deploy to any platform:

```bash
npm run build
```

The build output will be in `.next/standalone/` and includes:

- Self-contained Node.js server
- All required dependencies
- Static assets

### Deployment Options

- **Vercel** - Zero-config deployment
- **Docker** - Use the standalone output
- **Traditional hosting** - Run the standalone server
- **Cloudflare Workers** - With appropriate adapters

### Docker Deployment

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
EXPOSE 3000
CMD ["node", "server.js"]
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

- [HL7 SMART App Launch](https://build.fhir.org/ig/HL7/smart-app-launch/)
- [FHIR R4 Specification](https://hl7.org/fhir/R4/)
- [Epic SMART on FHIR](https://fhir.epic.com/)
- [Cerner SMART on FHIR](https://docs.oracle.com/en/industries/health/millennium-platform-apis/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

Contributions are welcome! Please ensure:

1. All tests pass (`npm test`)
2. Code is properly typed (no `any` types)
3. Follows existing code style
4. Includes appropriate tests
5. Updates documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- HL7 SMART Health IT team for the SMART App Launch Framework
- Epic, Cerner, and Athena for their FHIR implementations
- Shadcn for the excellent UI component library
- The Next.js and React teams for amazing frameworks

## 📞 Support

For issues and questions:

- Check the [troubleshooting section](#-troubleshooting)
- Review [SMART on FHIR documentation](https://build.fhir.org/ig/HL7/smart-app-launch/)
- Open an issue on GitHub

---

Built with ❤️ for healthcare interoperability
