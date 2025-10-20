# FHIR Write Operations Guide

> **Status**: ✅ Phase 2 Complete - Bi-Directional Write Operations Implemented

## Overview

This application now supports creating, updating, and deleting FHIR resources in Epic, Cerner, and Athena EHR systems. All write operations include:

- ✅ Audit logging (HIPAA compliance)
- ✅ Vendor-specific handling
- ✅ FHIR resource validation
- ✅ Error handling and retry logic
- ✅ Optimistic locking for updates

---

## Supported Write Operations

### Epic
| Resource Type | Create | Update | Delete | Notes |
|---------------|--------|--------|--------|-------|
| **DocumentReference** | ✅ | ✅ | ✅ | Clinical notes |
| **Observation** | ✅ | ✅ | ✅ | Lab results, vitals |
| **MedicationRequest** | ✅ | ✅ | ✅ | Prescriptions |
| **AllergyIntolerance** | ✅ | ✅ | ✅ | Allergy list |
| **Condition** | ❌ | ❌ | ❌ | Read-only in Epic |
| **Encounter** | ❌ | ❌ | ❌ | Read-only in Epic |

### Cerner
| Resource Type | Create | Update | Delete | Notes |
|---------------|--------|--------|--------|-------|
| **DocumentReference** | ✅ | ✅ | ✅ | Clinical notes |
| **Observation** | ✅ | ✅ | ✅ | Lab results, vitals |
| **MedicationRequest** | ✅ | ✅ | ✅ | Prescriptions |
| **AllergyIntolerance** | ✅ | ✅ | ✅ | Allergy list |
| **Condition** | ✅ | ✅ | ✅ | Conditions supported |

### Athena
| Resource Type | Create | Update | Delete | Notes |
|---------------|--------|--------|--------|-------|
| **DocumentReference** | ✅ | ✅ | ✅ | Clinical notes |
| **Observation** | ✅ | ✅ | ✅ | Lab results, vitals |
| **MedicationRequest** | ✅ | ✅ | ✅ | Prescriptions |
| **AllergyIntolerance** | ✅ | ✅ | ✅ | Allergy list |
| **Condition** | ✅ | ✅ | ✅ | Conditions supported |

---

## Architecture

### Write Operation Flow

```
┌─────────────────────────────────────────────────────┐
│            React Component (UI)                      │
│         (e.g., NoteEditor)                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         React Hook (useFhirMutation)                │
│  - useCreateFhirResource()                          │
│  - useUpdateFhirResource()                          │
│  - useDeleteFhirResource()                          │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         FHIR Write Utilities                        │
│  - createFhirResource()                             │
│  - updateFhirResource()                             │
│  - deleteFhirResource()                             │
└────────────────┬────────────────────────────────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
┌──────────────┐   ┌──────────────┐
│ Audit Logger │   │   Vendor     │
│  (HIPAA)     │   │   Adapter    │
└──────────────┘   └──────┬───────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  EHR FHIR    │
                   │    API       │
                   └──────────────┘
```

---

## Usage Examples

### 1. Creating a Clinical Note

```typescript
'use client';

import { useCreateFhirResource } from '@/hooks/use-fhir-mutation';
import type { DocumentReference } from '@medplum/fhirtypes';

export function NoteEditor() {
  const createNote = useCreateFhirResource<DocumentReference>('DocumentReference');

  const handleSubmit = async () => {
    const note: Omit<DocumentReference, 'id' | 'meta'> = {
      resourceType: 'DocumentReference',
      status: 'current',
      subject: { reference: 'Patient/123' },
      date: new Date().toISOString(),
      content: [{
        attachment: {
          contentType: 'text/plain',
          data: btoa('Clinical note content'),
          title: 'Progress Note',
        }
      }]
    };

    const result = await createNote.mutateAsync(note);

    if (result.success) {
      alert('Note saved to EHR!');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={createNote.isPending}>
      {createNote.isPending ? 'Saving...' : 'Save Note'}
    </button>
  );
}
```

### 2. Updating an Observation

```typescript
import { useUpdateFhirResource } from '@/hooks/use-fhir-mutation';
import type { Observation } from '@medplum/fhirtypes';

export function ObservationEditor() {
  const updateObs = useUpdateFhirResource<Observation>('Observation');

  const handleUpdate = async (obsId: string) => {
    const observation: Observation = {
      resourceType: 'Observation',
      id: obsId,
      status: 'final', // Changed from 'preliminary'
      code: {
        coding: [{ system: 'http://loinc.org', code: '8867-4' }]
      },
      subject: { reference: 'Patient/123' },
      valueQuantity: { value: 120, unit: 'mmHg' },
      meta: { versionId: '1' } // For optimistic locking
    };

    const result = await updateObs.mutateAsync({
      resourceId: obsId,
      resource: observation
    });

    if (result.success) {
      console.log('Updated version:', result.resource?.meta?.versionId);
    }
  };
}
```

### 3. Deleting a Resource

```typescript
import { useDeleteFhirResource } from '@/hooks/use-fhir-mutation';

export function ResourceDeleter() {
  const deleteDoc = useDeleteFhirResource('DocumentReference');

  const handleDelete = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    const result = await deleteDoc.mutateAsync(docId);

    if (result.success) {
      alert('Document deleted');
    }
  };
}
```

---

## Audit Logging

All write operations are automatically logged for HIPAA compliance.

### Audit Log Entry Structure

```typescript
{
  userId: 'user-123',
  userName: 'Dr. Jane Smith',
  userRole: 'clinician',
  patientId: 'patient-456',
  resourceType: 'DocumentReference',
  resourceId: 'doc-789',
  action: 'write', // or 'delete'
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  timestamp: '2025-01-20T12:00:00Z',
  iss: 'https://fhir.epic.com/...',
  vendor: 'epic',
  metadata: {
    operation: 'create',
    statusCode: 201
  }
}
```

### Viewing Audit Logs

```typescript
import { getAuditLogs, getWriteAuditLogs } from '@/lib/audit-logger';

// Get all audit logs
const allLogs = getAuditLogs();

// Get only write operations
const writeLogs = getWriteAuditLogs();

// Get logs for a specific patient
const patientLogs = getPatientAuditLogs('patient-123');
```

**Production**: In production, audit logs should be sent to Axiom or another HIPAA-compliant logging service. See implementation in `src/lib/audit-logger.ts`.

---

## FHIR Validation

Resources are validated before write operations to catch errors early.

### Validation Example

```typescript
import { validateFhirResource, isValidFhirResource } from '@/lib/validation/fhir-validator';

const observation = {
  resourceType: 'Observation',
  // Missing required 'status' field
  code: { coding: [{ system: 'http://loinc.org', code: '8867-4' }] }
};

// Quick validation
const isValid = isValidFhirResource(observation);
// → false

// Detailed validation
const result = validateFhirResource(observation);
console.log(result);
// {
//   valid: false,
//   errors: [
//     { field: 'status', message: 'Observation.status is required', severity: 'error' },
//     { field: 'subject', message: 'Observation.subject is required', severity: 'error' }
//   ],
//   warnings: []
// }
```

### Validation Rules

#### DocumentReference
- ✅ `status` required
- ✅ `content` required (with attachment)
- ✅ `subject` (patient reference) required

#### Observation
- ✅ `status` required
- ✅ `code` required
- ✅ `subject` required
- ⚠️ Should have `value[x]` or `component`

#### MedicationRequest
- ✅ `status` required
- ✅ `intent` required
- ✅ `medication[x]` required
- ✅ `subject` required
- ⚠️ Should have `dosageInstruction`

---

## Vendor-Specific Considerations

### Epic

**Scope Requirements**:
- Write scopes use `.ws` syntax (auto-converted from `.write`)
- Example: `patient/DocumentReference.ws`

**Limitations**:
- Condition and Encounter are read-only
- Write operations require Epic App Orchard approval

**Error Handling**:
```typescript
// Epic-specific error
if (error.message.includes('scope') && error.message.includes('denied')) {
  // User needs Epic admin to approve additional scopes
}
```

### Cerner

**Headers**:
- Includes `Prefer: return=representation` for all writes
- Returns created/updated resource in response

**Validation**:
- Stricter FHIR validation than Epic
- More likely to return OperationOutcome errors

**Tenant ID**:
- Automatically extracted from ISS URL
- Required for multi-tenant environments

### Athena

**Rate Limiting**:
- 10 requests/second per practice
- Automatic retry with exponential backoff
- Honors `Retry-After` header

**Practice ID**:
- Extracted from ISS URL
- Required for all operations

---

## Error Handling

### Common Error Scenarios

#### 1. Version Conflict (409)
```typescript
const result = await updateObs.mutateAsync({ resourceId, resource });

if (result.statusCode === 409) {
  alert('Resource was modified by another user. Please refresh and try again.');
  // Refetch the latest version
  const latest = await fetchLatestVersion(resourceId);
}
```

#### 2. Validation Error (400)
```typescript
if (result.statusCode === 400 && result.operationOutcome) {
  const issues = result.operationOutcome.issue || [];
  issues.forEach(issue => {
    console.error(`${issue.severity}: ${issue.diagnostics}`);
  });
}
```

#### 3. Permission Denied (403)
```typescript
if (result.statusCode === 403) {
  alert('You do not have permission to perform this action.');
  // Check required scopes
}
```

#### 4. Rate Limit (429)
```typescript
// Athena adapter automatically handles 429 with retry
// No manual handling needed
```

---

## Testing

### Unit Tests

```bash
# Test FHIR write utilities
bun test src/lib/fhir-write.test.ts

# Test validation
bun test src/lib/validation/fhir-validator.test.ts
```

### Integration Tests

```bash
# Test write operations with mocked API
bun test tests/integration/fhir-write.test.ts
```

### Manual Testing

1. **Launch from EHR sandbox** (Epic, Cerner, or Athena)
2. **Navigate to patient page**
3. **Scroll to "Write Operations" section**
4. **Fill out clinical note form**
5. **Click "Save Note to EHR"**
6. **Verify note appears in EHR sandbox**

---

## Security & Compliance

### HIPAA Requirements

✅ **Audit Logging**: All writes logged with user, patient, timestamp
✅ **Access Controls**: Better Auth RBAC + SMART scopes
✅ **Data Minimization**: Only request necessary scopes
✅ **Encryption in Transit**: HTTPS/TLS 1.3
⚠️ **Encryption at Rest**: SQLite not encrypted (use production database)

### Required Scopes

```json
{
  "scopes": [
    "patient/DocumentReference.write",
    "patient/Observation.write",
    "patient/MedicationRequest.write",
    "patient/AllergyIntolerance.write"
  ]
}
```

**Epic** (convert to `.ws`):
```json
{
  "scopes": [
    "patient/DocumentReference.ws",
    "patient/Observation.ws"
  ]
}
```

---

## API Reference

### `createFhirResource<T>()`

```typescript
function createFhirResource<T extends Resource>(
  fhirBaseUrl: string,
  resourceType: string,
  resource: Omit<T, 'id' | 'meta'>,
  accessToken: string,
  context: WriteContext,
  options?: WriteOptions
): Promise<WriteResult<T>>
```

### `updateFhirResource<T>()`

```typescript
function updateFhirResource<T extends Resource>(
  fhirBaseUrl: string,
  resourceType: string,
  resourceId: string,
  resource: T,
  accessToken: string,
  context: WriteContext,
  options?: WriteOptions
): Promise<WriteResult<T>>
```

### `deleteFhirResource()`

```typescript
function deleteFhirResource(
  fhirBaseUrl: string,
  resourceType: string,
  resourceId: string,
  accessToken: string,
  context: WriteContext,
  options?: WriteOptions
): Promise<WriteResult>
```

---

## Troubleshooting

### "Missing required authentication"
**Cause**: No token or user session
**Fix**: Ensure user is signed in and EHR context is valid

### "Version conflict"
**Cause**: Resource was modified by another user
**Fix**: Refetch latest version and merge changes

### "Write operations not supported"
**Cause**: Vendor doesn't support writes for this resource type
**Fix**: Check `adapter.supportsWrite(resourceType)`

### "Scope denied"
**Cause**: Missing write scopes
**Fix**: Add required scopes to OAuth configuration

---

## Next Steps: Phase 3 (Future)

⏳ **Marketplace Certification** (Weeks 9-24):
- Epic App Orchard certification
- Cerner Code Console certification
- Athena Marketplace certification
- Security reviews and compliance documentation

⏳ **Advanced Features**:
- Bulk operations ($batch, $transaction)
- FHIR Subscriptions (real-time updates)
- CDS Hooks integration
- FHIR Questionnaire support

---

## Resources

- **PRP**: `docs/PRPs/multi-vendor-ehr-integration-prp.md`
- **Vendor Guide**: `docs/VENDOR_GUIDE.md`
- **Phase 2 Summary**: `PHASE_2_IMPLEMENTATION_SUMMARY.md`
- **Audit Logger**: `src/lib/audit-logger.ts`
- **Validation**: `src/lib/validation/fhir-validator.ts`

---

**Status**: ✅ Phase 2 Complete - Write Operations Fully Implemented
**Date**: 2025-01-20
**Next**: Phase 3 - Marketplace Certification (Weeks 9-24)
