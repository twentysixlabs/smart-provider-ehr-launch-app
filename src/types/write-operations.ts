/**
 * Write Operations Types
 *
 * Types for FHIR resource creation, update, and deletion
 */

import type { OperationOutcome, Resource } from '@medplum/fhirtypes';

/**
 * Write operation result
 */
export interface WriteResult<T extends Resource = Resource> {
  success: boolean;
  resource?: T;
  operationOutcome?: OperationOutcome;
  error?: string;
  statusCode?: number;
}

/**
 * Write operation context (for audit logging)
 */
export interface WriteContext {
  userId: string;
  userName: string;
  userRole?: string;
  ipAddress: string;
  userAgent: string;
}

/**
 * Audit log entry for PHI access
 */
export interface AuditLogEntry {
  // User information
  userId: string;
  userName: string;
  userRole: string;

  // Patient information
  patientId: string;

  // Resource information
  resourceType: string;
  resourceId: string;

  // Action
  action: 'read' | 'write' | 'delete';

  // Context
  ipAddress: string;
  userAgent: string;
  timestamp: Date;

  // EHR context
  iss: string;
  vendor?: string;

  // Additional metadata
  metadata?: Record<string, unknown>;
}

/**
 * FHIR validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'fatal';
  path?: string;
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  message: string;
  severity: 'warning' | 'information';
  path?: string;
}

/**
 * Clinical note data
 */
export interface ClinicalNoteData {
  title: string;
  content: string;
  category: 'progress-note' | 'consultation' | 'discharge-summary' | 'history-and-physical';
  status: 'preliminary' | 'final' | 'amended';
}

/**
 * Lab order data
 */
export interface LabOrderData {
  testCode: string;
  testDisplay: string;
  priority: 'routine' | 'urgent' | 'stat';
  notes?: string;
}

/**
 * Medication data
 */
export interface MedicationData {
  medicationCode: string;
  medicationDisplay: string;
  dosageInstruction: string;
  status: 'active' | 'completed' | 'stopped' | 'draft';
  intent: 'order' | 'plan' | 'proposal';
}

/**
 * Write operation options
 */
export interface WriteOptions {
  // Retry on failure
  retry?: boolean;
  maxRetries?: number;

  // Validation
  validate?: boolean;
  strictValidation?: boolean;

  // Audit logging
  skipAudit?: boolean;

  // Version handling
  ifMatch?: string; // For optimistic locking

  // Vendor-specific options
  vendorOptions?: Record<string, unknown>;
}
