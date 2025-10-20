# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added - Phase 1: Multi-Vendor EHR Integration (2025-01-20)

#### Vendor Adapter Infrastructure
- **Epic Adapter** (`src/lib/vendors/epic-adapter.ts`)
  - Automatic scope conversion (.read → .rs, .write → .ws)
  - Epic-specific error handling (scope denial, rate limits)
  - Smart Style URL support
  - Rate limiting: 100 requests/minute

- **Cerner Adapter** (`src/lib/vendors/cerner-adapter.ts`)
  - Tenant ID extraction from ISS URL
  - Write headers with `Prefer: return=representation`
  - Cerner-specific error handling (tenant, DSTU2, validation)
  - Standard .read/.write scope syntax

- **Athena Adapter** (`src/lib/vendors/athena-adapter.ts`)
  - Practice ID extraction from ISS URL
  - Automatic rate limit handling (10 req/sec)
  - Retry logic with Retry-After header
  - Athena-specific error handling

- **Base Adapter** (`src/lib/vendors/base-adapter.ts`)
  - Abstract base class for all vendor adapters
  - Common FHIR read operations
  - OAuth configuration handling
  - Extensible error handling

#### Vendor Detection & Selection
- **Vendor Detection** (`src/lib/vendor-detection.ts`)
  - Automatic vendor detection from ISS URL
  - URL pattern matching for Epic, Cerner, Athena
  - Vendor adapter factory
  - Display name mapping

#### State Management
- **Vendor Store** (`src/stores/vendor-store.ts`)
  - Zustand store for vendor state
  - Persists vendor type and context
  - Tracks vendor-specific metadata
  - Clear vendor on logout

- **React Hooks** (`src/hooks/use-vendor-adapter.ts`)
  - `useVendorAdapter()` - Get current adapter instance
  - `useVendor()` - Get vendor type and helpers
  - Memoized for performance

#### UI Components
- **Vendor Badge** (`src/components/vendor-badge.tsx`)
  - Displays current EHR vendor
  - Vendor-specific colors
  - Tooltip with vendor information

#### Enhanced SMART Auth
- Updated `src/lib/smart-auth.ts` to use vendor adapters
- Automatic scope formatting per vendor
- Vendor type stored in OAuth state

#### Configuration
- **Athena Config** (`src/config/config.athena.prod.json`)
  - New configuration file for Athena deployments
  - Practice ID placeholder
  - Standard FHIR R4 scopes

- **Build Scripts** (package.json)
  - `bun run build:epic` - Build for Epic
  - `bun run build:cerner` - Build for Cerner
  - `bun run build:athena` - Build for Athena (NEW)

#### Types
- **Vendor Types** (`src/types/vendor.ts`)
  - VendorType, VendorContext, VendorConfig
  - VENDOR_CONFIGS configuration matrix
- Updated `src/types/index.ts` to export vendor types

#### Documentation
- **Vendor Guide** (`docs/VENDOR_GUIDE.md`)
  - Comprehensive guide for all three vendors
  - Vendor-specific features and requirements
  - Code examples and usage patterns
  - Testing strategies and troubleshooting

- **Quick Reference** (`docs/MULTI_VENDOR_QUICK_REFERENCE.md`)
  - One-page quick reference for vendor integration
  - Scope formatting examples
  - Troubleshooting tips

- **Phase 1 Summary** (`PHASE_1_IMPLEMENTATION_SUMMARY.md`)
  - Complete implementation documentation
  - Architecture diagrams
  - Testing guide
  - Next steps

- **Write Operations Guide** (`docs/WRITE_OPERATIONS.md`)
  - Placeholder for Phase 2

#### Testing
- **Unit Tests** (`tests/unit/vendor-detection.test.ts`)
  - Vendor detection from ISS URL
  - Adapter factory tests
  - Edge case handling

- **Unit Tests** (`tests/unit/vendor-adapters.test.ts`)
  - Epic scope formatting tests
  - Cerner write header tests
  - Athena rate limiting tests
  - Error handling for all vendors

#### Modified Files
- `src/app/auth/smart/callback/page.tsx` - Store vendor after OAuth
- `src/app/patient/page.tsx` - Show vendor badge, clear vendor on logout
- `src/types/index.ts` - Export vendor types
- `package.json` - Add Athena build script

### Breaking Changes
None - All changes are additive and backward compatible.

---

## [1.0.0] - 2025-01-20 (Previous Session)

### Added
- Better Auth integration for backend authentication
- Dual authentication system (Better Auth + SMART on FHIR)
- All type errors fixed for latest package versions
- Support for Bun, Biome, Motion, Medplum FHIR types

See previous documentation for full history.

---

## Next Release (Phase 2)

### Planned - Bi-Directional Write Operations
- FHIR write utilities (create, update, delete)
- React hooks for write operations
- Clinical note editor component
- Audit logging for all writes
- Vendor-specific write support
- Integration tests for writes

See `docs/PRPs/multi-vendor-ehr-integration-prp.md` for full roadmap.
