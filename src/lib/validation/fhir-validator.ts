/**
 * FHIR Resource Validation
 *
 * Validates FHIR resources before write operations
 */

import type { Resource } from '@medplum/fhirtypes';
import type { ValidationResult, ValidationError, ValidationWarning } from '@/types/write-operations';

/**
 * Validate a FHIR resource before write operation
 */
export function validateFhirResource(resource: Partial<Resource>): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Required: resourceType
  if (!resource.resourceType) {
    errors.push({
      field: 'resourceType',
      message: 'resourceType is required',
      severity: 'fatal',
    });
  }

  // Resource-specific validation
  switch (resource.resourceType) {
    case 'Patient':
      validatePatient(resource as Record<string, unknown>, errors, warnings);
      break;
    case 'Observation':
      validateObservation(resource as Record<string, unknown>, errors, warnings);
      break;
    case 'DocumentReference':
      validateDocumentReference(resource as Record<string, unknown>, errors, warnings);
      break;
    case 'MedicationRequest':
      validateMedicationRequest(resource as Record<string, unknown>, errors, warnings);
      break;
    case 'AllergyIntolerance':
      validateAllergyIntolerance(resource as Record<string, unknown>, errors, warnings);
      break;
    case 'Condition':
      validateCondition(resource as Record<string, unknown>, errors, warnings);
      break;
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate Patient resource
 */
function validatePatient(
  resource: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Patient should have at least one identifier or name
  if (!resource.identifier && !resource.name) {
    errors.push({
      field: 'identifier/name',
      message: 'Patient must have at least one identifier or name',
      severity: 'error',
    });
  }

  // Warn if no gender
  if (!resource.gender) {
    warnings.push({
      field: 'gender',
      message: 'Patient should have a gender specified',
      severity: 'warning',
    });
  }
}

/**
 * Validate Observation resource
 */
function validateObservation(
  resource: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required: status
  if (!resource.status) {
    errors.push({
      field: 'status',
      message: 'Observation.status is required',
      severity: 'error',
    });
  }

  // Required: code
  if (!resource.code) {
    errors.push({
      field: 'code',
      message: 'Observation.code is required',
      severity: 'error',
    });
  }

  // Required: subject (patient reference)
  if (!resource.subject) {
    errors.push({
      field: 'subject',
      message: 'Observation.subject is required',
      severity: 'error',
    });
  }

  // Should have either value[x] or component
  if (!resource.valueQuantity && !resource.valueString && !resource.component) {
    warnings.push({
      field: 'value/component',
      message: 'Observation should have either a value or components',
      severity: 'warning',
    });
  }
}

/**
 * Validate DocumentReference resource
 */
function validateDocumentReference(
  resource: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required: status
  if (!resource.status) {
    errors.push({
      field: 'status',
      message: 'DocumentReference.status is required',
      severity: 'error',
    });
  }

  // Required: content
  if (!resource.content || !Array.isArray(resource.content) || resource.content.length === 0) {
    errors.push({
      field: 'content',
      message: 'DocumentReference.content is required and must have at least one entry',
      severity: 'error',
    });
  }

  // Required: subject (patient reference)
  if (!resource.subject) {
    errors.push({
      field: 'subject',
      message: 'DocumentReference.subject is required',
      severity: 'error',
    });
  }

  // Check content has attachment
  if (Array.isArray(resource.content)) {
    for (let i = 0; i < resource.content.length; i++) {
      const content = resource.content[i] as Record<string, unknown>;
      if (!content.attachment) {
        errors.push({
          field: `content[${i}].attachment`,
          message: `DocumentReference.content[${i}] must have an attachment`,
          severity: 'error',
        });
      }
    }
  }
}

/**
 * Validate MedicationRequest resource
 */
function validateMedicationRequest(
  resource: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required: status
  if (!resource.status) {
    errors.push({
      field: 'status',
      message: 'MedicationRequest.status is required',
      severity: 'error',
    });
  }

  // Required: intent
  if (!resource.intent) {
    errors.push({
      field: 'intent',
      message: 'MedicationRequest.intent is required',
      severity: 'error',
    });
  }

  // Required: medication[x]
  if (!resource.medicationCodeableConcept && !resource.medicationReference) {
    errors.push({
      field: 'medication',
      message: 'MedicationRequest must have medicationCodeableConcept or medicationReference',
      severity: 'error',
    });
  }

  // Required: subject (patient reference)
  if (!resource.subject) {
    errors.push({
      field: 'subject',
      message: 'MedicationRequest.subject is required',
      severity: 'error',
    });
  }

  // Warn if no dosageInstruction
  if (!resource.dosageInstruction) {
    warnings.push({
      field: 'dosageInstruction',
      message: 'MedicationRequest should include dosage instructions',
      severity: 'warning',
    });
  }
}

/**
 * Validate AllergyIntolerance resource
 */
function validateAllergyIntolerance(
  resource: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required: patient
  if (!resource.patient) {
    errors.push({
      field: 'patient',
      message: 'AllergyIntolerance.patient is required',
      severity: 'error',
    });
  }

  // Required: code (what the allergy is)
  if (!resource.code) {
    errors.push({
      field: 'code',
      message: 'AllergyIntolerance.code is required',
      severity: 'error',
    });
  }

  // Warn if no clinicalStatus
  if (!resource.clinicalStatus) {
    warnings.push({
      field: 'clinicalStatus',
      message: 'AllergyIntolerance should have a clinicalStatus',
      severity: 'warning',
    });
  }
}

/**
 * Validate Condition resource
 */
function validateCondition(
  resource: Record<string, unknown>,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): void {
  // Required: subject (patient reference)
  if (!resource.subject) {
    errors.push({
      field: 'subject',
      message: 'Condition.subject is required',
      severity: 'error',
    });
  }

  // Required: code (what the condition is)
  if (!resource.code) {
    errors.push({
      field: 'code',
      message: 'Condition.code is required',
      severity: 'error',
    });
  }

  // Warn if no clinicalStatus
  if (!resource.clinicalStatus) {
    warnings.push({
      field: 'clinicalStatus',
      message: 'Condition should have a clinicalStatus',
      severity: 'warning',
    });
  }
}

/**
 * Quick validation check (returns boolean only)
 */
export function isValidFhirResource(resource: Partial<Resource>): boolean {
  const result = validateFhirResource(resource);
  return result.valid;
}
