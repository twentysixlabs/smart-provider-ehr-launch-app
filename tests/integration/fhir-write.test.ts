/**
 * FHIR Write Operations Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createFhirResource, updateFhirResource, deleteFhirResource } from '@/lib/fhir-write';
import type { DocumentReference, Observation } from '@medplum/fhirtypes';
import type { WriteContext } from '@/types/write-operations';

// Mock fetch globally
global.fetch = vi.fn();

describe('FHIR Write Operations', () => {
  const fhirBaseUrl = 'https://fhir.epic.com/test';
  const accessToken = 'test-token';
  const context: WriteContext = {
    userId: 'user-123',
    userName: 'Dr. Test',
    userRole: 'clinician',
    ipAddress: '127.0.0.1',
    userAgent: 'test-agent',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createFhirResource', () => {
    it('should create a DocumentReference successfully', async () => {
      const documentReference: Omit<DocumentReference, 'id' | 'meta'> = {
        resourceType: 'DocumentReference',
        status: 'current',
        subject: { reference: 'Patient/123' },
        content: [
          {
            attachment: {
              contentType: 'text/plain',
              data: btoa('Test note'),
            },
          },
        ],
      };

      const mockResponse = {
        ...documentReference,
        id: 'doc-123',
        meta: {
          versionId: '1',
          lastUpdated: '2025-01-20T00:00:00Z',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse,
      });

      const result = await createFhirResource<DocumentReference>(
        fhirBaseUrl,
        'DocumentReference',
        documentReference,
        accessToken,
        context
      );

      expect(result.success).toBe(true);
      expect(result.resource?.id).toBe('doc-123');
      expect(result.statusCode).toBe(201);
    });

    it('should handle creation failure', async () => {
      const observation: Omit<Observation, 'id' | 'meta'> = {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4' }],
        },
        subject: { reference: 'Patient/123' },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({
          resourceType: 'OperationOutcome',
          issue: [
            {
              severity: 'error',
              code: 'invalid',
              diagnostics: 'Missing required field',
            },
          ],
        }),
      });

      const result = await createFhirResource<Observation>(
        fhirBaseUrl,
        'Observation',
        observation,
        accessToken,
        context
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create');
      expect(result.statusCode).toBe(400);
    });
  });

  describe('updateFhirResource', () => {
    it('should update a resource successfully', async () => {
      const observation: Observation = {
        resourceType: 'Observation',
        id: 'obs-123',
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4' }],
        },
        subject: { reference: 'Patient/123' },
      };

      const mockResponse = {
        ...observation,
        meta: {
          versionId: '2',
          lastUpdated: '2025-01-20T00:00:00Z',
        },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await updateFhirResource<Observation>(
        fhirBaseUrl,
        'Observation',
        'obs-123',
        observation,
        accessToken,
        context
      );

      expect(result.success).toBe(true);
      expect(result.resource?.meta?.versionId).toBe('2');
      expect(result.statusCode).toBe(200);
    });

    it('should handle version conflicts', async () => {
      const observation: Observation = {
        resourceType: 'Observation',
        id: 'obs-123',
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4' }],
        },
        subject: { reference: 'Patient/123' },
        meta: { versionId: '1' },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 409,
        statusText: 'Conflict',
      });

      const result = await updateFhirResource<Observation>(
        fhirBaseUrl,
        'Observation',
        'obs-123',
        observation,
        accessToken,
        context
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Version conflict');
      expect(result.statusCode).toBe(409);
    });
  });

  describe('deleteFhirResource', () => {
    it('should delete a resource successfully', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await deleteFhirResource(
        fhirBaseUrl,
        'DocumentReference',
        'doc-123',
        accessToken,
        context
      );

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(204);
    });

    it('should handle deletion failure', async () => {
      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({}),
      });

      const result = await deleteFhirResource(
        fhirBaseUrl,
        'DocumentReference',
        'doc-123',
        accessToken,
        context
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to delete');
      expect(result.statusCode).toBe(404);
    });
  });

  describe('Vendor-specific headers', () => {
    it('should add Cerner Prefer header', async () => {
      const resource: Omit<Observation, 'id' | 'meta'> = {
        resourceType: 'Observation',
        status: 'final',
        code: {
          coding: [{ system: 'http://loinc.org', code: '8867-4' }],
        },
        subject: { reference: 'Patient/123' },
      };

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ ...resource, id: 'obs-123' }),
      });

      await createFhirResource<Observation>(
        'https://fhir.cerner.com/test',
        'Observation',
        resource,
        accessToken,
        context
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Prefer: 'return=representation',
          }),
        })
      );
    });
  });
});
