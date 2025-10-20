# FHIR Write Operations Guide

> **Status**: 🚧 Phase 2 - Coming Soon
> 
> This document will be completed in Phase 2 of the multi-vendor integration roadmap.

## Overview

This guide will cover:

- Creating FHIR resources (POST)
- Updating FHIR resources (PUT)
- Deleting FHIR resources (DELETE)
- Vendor-specific write requirements
- Audit logging for all write operations
- Error handling and validation

## Supported Write Operations (Planned)

### Epic
- ✅ DocumentReference (Clinical notes)
- ✅ Observation (Lab results, vitals)
- ✅ MedicationRequest (Prescriptions)
- ✅ AllergyIntolerance (Allergy list)
- ❌ Condition (Read-only in Epic)
- ❌ Encounter (Read-only in Epic)

### Cerner
- ✅ DocumentReference
- ✅ Observation
- ✅ MedicationRequest
- ✅ Condition
- ✅ AllergyIntolerance

### Athena
- ✅ DocumentReference
- ✅ Observation
- ✅ MedicationRequest
- ✅ Condition
- ✅ AllergyIntolerance

## Implementation Status

Phase 2 (Weeks 5-8) will implement:

1. **FHIR Write Utilities** (`src/lib/fhir-write.ts`)
   - `createFhirResource()` - Create new resources
   - `updateFhirResource()` - Update existing resources
   - `deleteFhirResource()` - Delete resources

2. **React Hooks** (`src/hooks/use-fhir-mutation.ts`)
   - `useCreateFhirResource()` - React Query mutation for creates
   - `useUpdateFhirResource()` - React Query mutation for updates
   - `useDeleteFhirResource()` - React Query mutation for deletes

3. **UI Components**
   - Clinical Note Editor (`src/components/patient/note-editor.tsx`)
   - Lab Order Form (`src/components/patient/order-form.tsx`)
   - Medication Manager (`src/components/patient/medication-manager.tsx`)

4. **Audit Logging**
   - All write operations logged to Axiom
   - User, patient, resource, timestamp captured
   - PHI access audit trail for HIPAA compliance

## Usage Examples (Coming Soon)

```typescript
'use client';

import { useCreateFhirResource } from '@/hooks/use-fhir-mutation';
import type { DocumentReference } from '@/types/fhir';

export function NoteEditor() {
  const createNote = useCreateFhirResource<DocumentReference>('DocumentReference');

  const handleSubmit = async (noteData) => {
    const result = await createNote.mutateAsync({
      resourceType: 'DocumentReference',
      status: 'current',
      subject: { reference: 'Patient/123' },
      content: [{
        attachment: {
          contentType: 'text/plain',
          data: btoa(noteData.content)
        }
      }]
    });

    if (result.success) {
      alert('Note saved to EHR!');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Note editor UI */}
    </form>
  );
}
```

## Reference

See the full PRP: [multi-vendor-ehr-integration-prp.md](./PRPs/multi-vendor-ehr-integration-prp.md)
