# Multi-Vendor Integration Quick Reference

## 🎯 Quick Start

### Detect Vendor
```typescript
import { detectVendor } from '@/lib/vendor-detection';

const vendor = detectVendor(iss);
// Returns: 'epic' | 'cerner' | 'athena' | 'unknown'
```

### Get Vendor Adapter
```typescript
import { getVendorAdapter } from '@/lib/vendor-detection';

const adapter = getVendorAdapter(vendor);
// Returns vendor-specific adapter instance
```

### Use in React
```typescript
import { useVendor } from '@/hooks/use-vendor-adapter';

const { vendor, adapter, isEpic, isCerner, isAthena } = useVendor();
```

---

## 🏥 Vendor-Specific Details

### Epic
| Feature | Value |
|---------|-------|
| **Scope Format** | `.rs` (read), `.ws` (write) |
| **Rate Limit** | 100 requests/minute |
| **Special** | smart_style_url for UI |
| **ISS Pattern** | Contains: `epic.com`, `epiccare` |

### Cerner
| Feature | Value |
|---------|-------|
| **Scope Format** | `.read`, `.write` (standard) |
| **Rate Limit** | Varies by tenant |
| **Special** | Tenant ID required |
| **ISS Pattern** | Contains: `cerner.com`, `oracle.com/health` |

### Athena
| Feature | Value |
|---------|-------|
| **Scope Format** | `.read`, `.write` (standard) |
| **Rate Limit** | 10 requests/second |
| **Special** | Practice ID required |
| **ISS Pattern** | Contains: `athenahealth.com`, `athenanet` |

---

## 📝 Scope Formatting

```typescript
// Epic Adapter
adapter.formatScopes(['patient/Patient.read'])
// → ['patient/Patient.rs']

adapter.formatScopes(['patient/DocumentReference.write'])
// → ['patient/DocumentReference.ws']

// Cerner/Athena Adapters
adapter.formatScopes(['patient/Patient.read'])
// → ['patient/Patient.read'] (no change)
```

---

## 🎨 UI Components

### Vendor Badge
```tsx
import { VendorBadge } from '@/components/vendor-badge';

<VendorBadge />
// Shows: "Epic", "Cerner / Oracle Health", or "Athena Health"
```

### Conditional Rendering
```tsx
const { isEpic, isCerner, isAthena } = useVendor();

if (isEpic) {
  return <EpicSpecificFeature />;
}

if (isCerner) {
  return <CernerSpecificFeature />;
}
```

---

## 🔧 Configuration Files

| Vendor | File | Usage |
|--------|------|-------|
| Epic | `config.epic.prod.json` | `bun run build:epic` |
| Cerner | `config.cerner.prod.json` | `bun run build:cerner` |
| Athena | `config.athena.prod.json` | `bun run build:athena` |

---

## 🧪 Testing

### Run Unit Tests
```bash
# Vendor detection tests
bun test tests/unit/vendor-detection.test.ts

# Adapter tests
bun test tests/unit/vendor-adapters.test.ts

# All tests
bun test
```

### Manual Testing
```bash
# Build for specific vendor
bun run build:epic
bun run build:cerner
bun run build:athena

# Type check
bun run type-check

# Lint
bun run lint
```

---

## 🚀 Deployment

### Subdomain Strategy (Recommended)
```bash
# Epic
vercel --prod --name smart-fhir-epic

# Cerner
vercel --prod --name smart-fhir-cerner

# Athena
vercel --prod --name smart-fhir-athena
```

**DNS**:
```
epic.yourdomain.com    → Epic deployment
cerner.yourdomain.com  → Cerner deployment
athena.yourdomain.com  → Athena deployment
```

---

## ❓ Troubleshooting

### Epic: "Scope denied"
```
Error: Epic requires additional scope approval
Fix: Contact Epic admin to approve scopes in App Orchard
```

### Cerner: "Tenant error"
```
Error: Cerner tenant configuration error
Fix: Verify ISS URL includes /tenant/{ID}/
```

### Athena: "Rate limit"
```
Error: Rate limit exceeded (10 req/sec)
Fix: Reduce request frequency, adapter auto-retries
```

---

## 📚 Full Documentation

- **Vendor Guide**: `docs/VENDOR_GUIDE.md`
- **Write Operations** (Phase 2): `docs/WRITE_OPERATIONS.md`
- **Full PRP**: `docs/PRPs/multi-vendor-ehr-integration-prp.md`
- **Implementation Summary**: `PHASE_1_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Phase 1 Checklist

- [x] Epic adapter with .rs scopes
- [x] Cerner adapter with tenant handling
- [x] Athena adapter with practice ID
- [x] Vendor detection utility
- [x] React hooks and store
- [x] Vendor badge UI component
- [x] SMART auth integration
- [x] Unit tests
- [x] Documentation

**Status**: ✅ Phase 1 Complete
**Next**: Phase 2 - Write Operations
