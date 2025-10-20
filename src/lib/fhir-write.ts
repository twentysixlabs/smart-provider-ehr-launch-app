/**
 * FHIR Write Operations
 *
 * Utilities for creating, updating, and deleting FHIR resources
 */

import type { OperationOutcome, Resource } from '@medplum/fhirtypes';
import type { WriteContext, WriteOptions, WriteResult } from '@/types/write-operations';
import { logPHIAccess } from './audit-logger';
import { detectVendor } from './vendor-detection';

/**
 * Create a new FHIR resource
 */
export async function createFhirResource<T extends Resource>(
  fhirBaseUrl: string,
  resourceType: string,
  resource: Omit<T, 'id' | 'meta'>,
  accessToken: string,
  context: WriteContext,
  options: WriteOptions = {}
): Promise<WriteResult<T>> {
  const { validate: _unusedValidate = true, skipAudit = false, vendorOptions = {} } = options;

  try {
    // Build the resource URL
    const url = `${fhirBaseUrl}/${resourceType}`;

    // Make the POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/fhir+json',
        Accept: 'application/fhir+json',
        ...getVendorHeaders(fhirBaseUrl, 'create', vendorOptions),
      },
      body: JSON.stringify(resource),
    });

    // Log write operation for audit trail (HIPAA compliance)
    if (!skipAudit) {
      await logPHIAccess({
        userId: context.userId,
        userName: context.userName,
        userRole: context.userRole || 'clinician',
        patientId: extractPatientId(resource as Partial<T>),
        resourceType,
        resourceId: 'creating',
        action: 'write',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
        iss: fhirBaseUrl,
        vendor: detectVendor(fhirBaseUrl),
        metadata: {
          operation: 'create',
          statusCode: response.status,
        },
      });
    }

    // Handle non-OK responses
    if (!response.ok) {
      const outcome = (await response.json().catch(() => null)) as OperationOutcome | null;
      return {
        success: false,
        operationOutcome: outcome || undefined,
        error: `Failed to create ${resourceType}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    // Parse the created resource
    const created = (await response.json()) as T;

    return {
      success: true,
      resource: created,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
    };
  }
}

/**
 * Update an existing FHIR resource
 */
export async function updateFhirResource<T extends Resource>(
  fhirBaseUrl: string,
  resourceType: string,
  resourceId: string,
  resource: T,
  accessToken: string,
  context: WriteContext,
  options: WriteOptions = {}
): Promise<WriteResult<T>> {
  const { ifMatch, skipAudit = false, vendorOptions = {} } = options;

  try {
    const url = `${fhirBaseUrl}/${resourceType}/${resourceId}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
      ...getVendorHeaders(fhirBaseUrl, 'update', vendorOptions),
    };

    // Add If-Match header for optimistic locking
    if (ifMatch || resource.meta?.versionId) {
      headers['If-Match'] = ifMatch || `W/"${resource.meta?.versionId}"`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(resource),
    });

    // Log write operation
    if (!skipAudit) {
      await logPHIAccess({
        userId: context.userId,
        userName: context.userName,
        userRole: context.userRole || 'clinician',
        patientId: extractPatientId(resource),
        resourceType,
        resourceId,
        action: 'write',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
        iss: fhirBaseUrl,
        vendor: detectVendor(fhirBaseUrl),
        metadata: {
          operation: 'update',
          statusCode: response.status,
          versionId: resource.meta?.versionId,
        },
      });
    }

    // Handle version conflict (409)
    if (response.status === 409) {
      return {
        success: false,
        error:
          'Version conflict: Resource was modified by another user. Please refresh and try again.',
        statusCode: 409,
      };
    }

    // Handle other non-OK responses
    if (!response.ok) {
      const outcome = (await response.json().catch(() => null)) as OperationOutcome | null;
      return {
        success: false,
        operationOutcome: outcome || undefined,
        error: `Failed to update ${resourceType}/${resourceId}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    // Parse the updated resource
    const updated = (await response.json()) as T;

    return {
      success: true,
      resource: updated,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
    };
  }
}

/**
 * Delete a FHIR resource
 */
export async function deleteFhirResource(
  fhirBaseUrl: string,
  resourceType: string,
  resourceId: string,
  accessToken: string,
  context: WriteContext,
  options: WriteOptions = {}
): Promise<WriteResult> {
  const { skipAudit = false, vendorOptions = {} } = options;

  try {
    const url = `${fhirBaseUrl}/${resourceType}/${resourceId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/fhir+json',
        ...getVendorHeaders(fhirBaseUrl, 'delete', vendorOptions),
      },
    });

    // Log delete operation
    if (!skipAudit) {
      await logPHIAccess({
        userId: context.userId,
        userName: context.userName,
        userRole: context.userRole || 'clinician',
        patientId: 'unknown', // Cannot extract from deleted resource
        resourceType,
        resourceId,
        action: 'delete',
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        timestamp: new Date(),
        iss: fhirBaseUrl,
        vendor: detectVendor(fhirBaseUrl),
        metadata: {
          operation: 'delete',
          statusCode: response.status,
        },
      });
    }

    // Handle non-OK responses
    if (!response.ok && response.status !== 204) {
      const outcome = (await response.json().catch(() => null)) as OperationOutcome | null;
      return {
        success: false,
        operationOutcome: outcome || undefined,
        error: `Failed to delete ${resourceType}/${resourceId}: ${response.statusText}`,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      statusCode: 500,
    };
  }
}

/**
 * Get vendor-specific headers for write operations
 */
function getVendorHeaders(
  fhirBaseUrl: string,
  operation: 'create' | 'update' | 'delete',
  vendorOptions: Record<string, unknown>
): Record<string, string> {
  const vendor = detectVendor(fhirBaseUrl);
  const headers: Record<string, string> = {};

  // Cerner prefers return=representation
  if (vendor === 'cerner' && (operation === 'create' || operation === 'update')) {
    headers.Prefer = 'return=representation';
  }

  // Add any vendor-specific options
  if (vendorOptions.headers) {
    Object.assign(headers, vendorOptions.headers);
  }

  return headers;
}

/**
 * Extract patient ID from a FHIR resource
 */
function extractPatientId(resource: Partial<Resource>): string {
  // Try subject reference
  const subject = (resource as { subject?: { reference?: string } }).subject;
  if (subject?.reference) {
    const match = subject.reference.match(/Patient\/([^/]+)/);
    if (match?.[1]) {
      return match[1];
    }
  }

  // For Patient resources, use the resource ID
  if (resource.resourceType === 'Patient' && resource.id) {
    return resource.id;
  }

  return 'unknown';
}

/**
 * Retry a write operation with exponential backoff
 */
export async function retryWriteOperation<T extends Resource>(
  operation: () => Promise<WriteResult<T>>,
  maxRetries = 3,
  initialDelay = 1000
): Promise<WriteResult<T>> {
  let lastResult: WriteResult<T> | null = null;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    lastResult = await operation();

    if (lastResult.success) {
      return lastResult;
    }

    // Don't retry on client errors (4xx except 429)
    if (
      lastResult.statusCode &&
      lastResult.statusCode >= 400 &&
      lastResult.statusCode < 500 &&
      lastResult.statusCode !== 429
    ) {
      return lastResult;
    }

    // Don't retry on last attempt
    if (attempt === maxRetries) {
      break;
    }

    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));
    delay *= 2; // Exponential backoff
  }

  return lastResult || { success: false, error: 'Max retries exceeded', statusCode: 500 };
}
