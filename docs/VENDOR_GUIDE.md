# Multi-Vendor EHR Integration Guide

This guide explains how the application supports Epic, Cerner (Oracle Health), and Athena EHR systems through vendor-specific adapters.

## Overview

The application uses a **vendor adapter pattern** to handle differences between Epic, Cerner, and Athena EHR systems while maintaining a unified FHIR-based interface.

### Supported Vendors

| Vendor | Market Share | Scope Format | Special Requirements |
|--------|--------------|--------------|---------------------|
| **Epic** | 31% | `.rs` (read scope) | `smart_style_url` for UI customization |
| **Cerner** | 25% | `.read` (standard) | Tenant ID in ISS URL |
| **Athena** | 8% | `.read` (standard) | Practice ID in ISS URL |

## Architecture

### Vendor Adapter Pattern

```
┌─────────────────────────────────────────────┐
│         SMART on FHIR App Layer             │
├─────────────────────────────────────────────┤
│          Vendor Detection Layer             │
│  (detectVendor, getVendorAdapter)           │
├─────────────────────────────────────────────┤
│           Vendor Adapters                   │
│  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │ Epic   │  │Cerner  │  │Athena  │        │
│  │Adapter │  │Adapter │  │Adapter │        │
│  └────────┘  └────────┘  └────────┘        │
├─────────────────────────────────────────────┤
│            Base Adapter                     │
│  (Common FHIR read/write operations)        │
├─────────────────────────────────────────────┤
│         EHR FHIR APIs                       │
│  Epic | Cerner | Athena                     │
└─────────────────────────────────────────────┘
```

## Vendor-Specific Implementation

### Epic Adapter

**Scope Formatting**:
```typescript
// Input: patient/Observation.read
// Output: patient/Observation.rs (Epic uses .rs)

// Input: patient/DocumentReference.write
// Output: patient/DocumentReference.ws (Epic uses .ws)
```

**Configuration** (`src/config/config.epic.prod.json`):
```json
{
  "CLIENT_ID": "YOUR_EPIC_CLIENT_ID",
  "BASE_URL": "https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4",
  "SMART_SCOPES": [
    "launch",
    "launch/patient",
    "openid",
    "fhirUser",
    "patient/Patient.rs",
    "patient/Observation.rs",
    "offline_access"
  ]
}
```

**Epic-Specific Features**:
- **Smart Style URL**: Epic provides a `smart_style_url` in the token response for UI customization
- **Rate Limiting**: 100 requests/minute per app
- **Write Operations**: Supports DocumentReference, Observation, MedicationRequest, AllergyIntolerance
- **Read-Only Resources**: Condition, Encounter are read-only

**Error Handling**:
```typescript
// Epic-specific error codes
if (error.includes('scope') && error.includes('denied')) {
  // User needs to approve additional scopes in Epic
}
```

### Cerner Adapter

**Scope Formatting**:
```typescript
// No transformation needed - uses standard .read/.write
// Input: patient/Observation.read
// Output: patient/Observation.read
```

**Configuration** (`src/config/config.cerner.prod.json`):
```json
{
  "CLIENT_ID": "YOUR_CERNER_CLIENT_ID",
  "BASE_URL": "https://fhir-myrecord.cerner.com/r4/tenant/YOUR_TENANT/fhir",
  "SMART_SCOPES": [
    "launch",
    "launch/patient",
    "openid",
    "fhirUser",
    "patient/Patient.read",
    "patient/Observation.read",
    "offline_access"
  ]
}
```

**Cerner-Specific Features**:
- **Tenant Parameter**: Multi-tenant environments require tenant ID in ISS URL
- **Tenant Extraction**: `https://fhir-myrecord.cerner.com/r4/tenant/12345/fhir` → tenant: `12345`
- **FHIR Version**: Some sandboxes use DSTU2 (legacy), production uses R4
- **Write Headers**: Prefer `return=representation` to get created resource back
- **Validation**: Stricter FHIR validation than Epic

**Tenant Handling**:
```typescript
// Adapter automatically extracts tenant from ISS URL
const tenant = this.extractTenantFromIss(iss);
config.tenant = tenant;
```

### Athena Adapter

**Scope Formatting**:
```typescript
// No transformation needed - uses standard .read/.write
// Input: patient/Observation.read
// Output: patient/Observation.read
```

**Configuration** (`src/config/config.athena.prod.json`):
```json
{
  "CLIENT_ID": "YOUR_ATHENA_CLIENT_ID",
  "BASE_URL": "https://api.athenahealth.com/fhir/r4/YOUR_PRACTICE_ID",
  "SMART_SCOPES": [
    "launch",
    "launch/patient",
    "openid",
    "fhirUser",
    "patient/Patient.read",
    "patient/Observation.read",
    "offline_access"
  ]
}
```

**Athena-Specific Features**:
- **Practice ID**: Required in ISS URL and some API calls
- **Practice Extraction**: `https://api.athenahealth.com/fhir/r4/12345/` → practiceId: `12345`
- **Rate Limiting**: 10 requests/second per practice (stricter than Epic/Cerner)
- **Marketplace**: Pre-configured OAuth for marketplace partners
- **Extensions**: Proprietary extensions on some resources

**Rate Limiting**:
```typescript
// Adapter automatically handles 429 responses
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  // Retry request
}
```

## Vendor Detection

The app automatically detects the EHR vendor from the ISS URL during SMART launch:

```typescript
import { detectVendor } from '@/lib/vendor-detection';

// Epic
detectVendor('https://fhir.epic.com/...') // → 'epic'

// Cerner
detectVendor('https://fhir-myrecord.cerner.com/...') // → 'cerner'

// Athena
detectVendor('https://api.athenahealth.com/...') // → 'athena'
```

### Detection Rules

| Vendor | URL Pattern |
|--------|-------------|
| Epic | Contains: `epic.com`, `epiccare`, `/epic/` |
| Cerner | Contains: `cerner.com`, `cernercare`, `oracle.com/health`, `/cerner/` |
| Athena | Contains: `athenahealth.com`, `athenanet` |

## Using Vendor Adapters

### In React Components

```typescript
'use client';

import { useVendor } from '@/hooks/use-vendor-adapter';

export function MyComponent() {
  const { vendor, adapter, isEpic, isCerner, isAthena } = useVendor();

  // Vendor-specific UI
  if (isEpic) {
    return <EpicSpecificFeature />;
  }

  // Use adapter for API calls
  if (adapter) {
    const patient = await adapter.readResource<Patient>(url, token);
  }

  return <div>Current vendor: {vendor}</div>;
}
```

### In Server/Utility Functions

```typescript
import { detectVendor, getVendorAdapter } from '@/lib/vendor-detection';

export async function fetchPatientData(iss: string, token: string) {
  // Detect vendor
  const vendor = detectVendor(iss);
  
  // Get appropriate adapter
  const adapter = getVendorAdapter(vendor);
  
  // Use adapter for API call
  const patient = await adapter.readResource<Patient>(
    `${iss}/Patient/123`,
    token
  );
  
  return patient;
}
```

## Deployment Strategy

### Subdomain Approach (Recommended)

Deploy separate instances for each vendor:

```
epic.yourdomain.com      → Epic deployment
cerner.yourdomain.com    → Cerner deployment
athena.yourdomain.com    → Athena deployment
```

**Advantages**:
- Vendor-specific CLIENT_ID and redirect URIs
- Separate analytics and monitoring per vendor
- Easier vendor certification
- Isolated deployments

**Build Scripts**:
```bash
# Epic
bun run build:epic

# Cerner
bun run build:cerner

# Athena
bun run build:athena
```

### Single Domain Approach (Alternative)

Deploy once with runtime vendor detection:

```
app.yourdomain.com  → Detects vendor from ISS URL
```

**Advantages**:
- Single deployment
- Simpler infrastructure
- Dynamic vendor switching

**Disadvantages**:
- More complex OAuth configuration
- Harder to get vendor certification

## Testing

### Unit Tests

Test vendor-specific behavior:

```typescript
import { EpicAdapter } from '@/lib/vendors/epic-adapter';

describe('EpicAdapter', () => {
  it('formats scopes to .rs syntax', () => {
    const adapter = new EpicAdapter();
    const scopes = ['patient/Observation.read', 'patient/Patient.read'];
    const formatted = adapter.formatScopes(scopes);
    
    expect(formatted).toEqual([
      'patient/Observation.rs',
      'patient/Patient.rs'
    ]);
  });
});
```

### E2E Tests (Phase 1 Complete)

Test full launch flow for each vendor:

```bash
# Epic E2E tests
npx playwright test tests/e2e/epic-launch.spec.ts

# Cerner E2E tests
npx playwright test tests/e2e/cerner-launch.spec.ts

# Athena E2E tests
npx playwright test tests/e2e/athena-launch.spec.ts
```

## Vendor Certification

### Epic App Orchard

1. **Register App**: https://apporchard.epic.com/
2. **Sandbox Testing**: Complete all test scenarios
3. **Security Review**: Submit security questionnaire
4. **Performance**: Load time < 2 seconds
5. **Timeline**: 6-8 weeks for approval

### Cerner Code Console

1. **Register App**: https://code-console.cerner.com/
2. **Sandbox Testing**: Test in Cerner sandbox
3. **Production Review**: Submit for review
4. **Timeline**: 4-6 weeks for approval

### Athena Marketplace

1. **Developer Account**: Contact Athena developer relations
2. **Sandbox Access**: Request sandbox environment
3. **Marketplace Submission**: Submit app for review
4. **Timeline**: 6-8 weeks for approval

## Troubleshooting

### Common Issues

**Epic**: Scope denied error
```
Error: "Epic requires additional scope approval"
Solution: Contact Epic administrator to approve scopes in App Orchard
```

**Cerner**: Tenant mismatch
```
Error: "Cerner tenant configuration error"
Solution: Verify ISS URL includes correct tenant ID
```

**Athena**: Rate limit exceeded
```
Error: "Athena rate limit exceeded"
Solution: Reduce request frequency to < 10/second per practice
```

### Debug Mode

Enable vendor-specific logging:

```typescript
// In browser console
localStorage.setItem('debug-vendor', 'true');

// Will log:
// - Vendor detection
// - Scope formatting
// - API calls with vendor context
```

## Vendor Support Matrix

| Feature | Epic | Cerner | Athena |
|---------|------|--------|--------|
| **Read Operations** | ✅ Full | ✅ Full | ✅ Full |
| **Write Operations** | ✅ Partial | ✅ Full | ✅ Full |
| **FHIR Version** | R4 | R4 | R4 |
| **SMART Launch** | ✅ | ✅ | ✅ |
| **Token Refresh** | ✅ | ✅ | ✅ |
| **Smart Styles** | ✅ | ❌ | ❌ |
| **Tenant Support** | N/A | ✅ | N/A |
| **Practice ID** | N/A | N/A | ✅ |
| **Rate Limit** | 100/min | Varies | 10/sec |

## Resources

### Epic
- [Epic FHIR Documentation](https://fhir.epic.com/)
- [Epic App Orchard](https://apporchard.epic.com/)
- [Epic SMART Best Practices](https://fhir.epic.com/Documentation?docId=oauth2&section=Scopes)

### Cerner
- [Cerner FHIR APIs](https://docs.oracle.com/en/industries/health/millennium-platform-apis/)
- [Cerner Code Console](https://code-console.cerner.com/)
- [Cerner SMART Tutorial](https://engineering.cerner.com/smart-on-fhir-tutorial/)

### Athena
- [Athena API Documentation](https://developer.athenahealth.com/)
- [Athena FHIR Docs](https://docs.athenahealth.com/api/guides/fhir)
- [Athena Marketplace](https://marketplace.athenahealth.com/)

## Next Steps

✅ **Phase 1 Complete**: Multi-vendor read operations
🚧 **Phase 2 (Next)**: Bi-directional write operations
⏳ **Phase 3 (Future)**: Marketplace certification

See [multi-vendor-ehr-integration-prp.md](./PRPs/multi-vendor-ehr-integration-prp.md) for the full roadmap.
