/**
 * Vendor Adapter Tests
 */

import { describe, expect, it } from 'vitest';
import { AthenaAdapter } from '@/lib/vendors/athena-adapter';
import { CernerAdapter } from '@/lib/vendors/cerner-adapter';
import { EpicAdapter } from '@/lib/vendors/epic-adapter';

describe('EpicAdapter', () => {
  const adapter = new EpicAdapter();

  it('has correct name', () => {
    expect(adapter.name).toBe('epic');
  });

  describe('formatScopes', () => {
    it('converts .read to .rs', () => {
      const scopes = ['patient/Patient.read', 'patient/Observation.read', 'patient/Condition.read'];
      const formatted = adapter.formatScopes(scopes);

      expect(formatted).toEqual([
        'patient/Patient.rs',
        'patient/Observation.rs',
        'patient/Condition.rs',
      ]);
    });

    it('converts .write to .ws', () => {
      const scopes = ['patient/DocumentReference.write', 'patient/MedicationRequest.write'];
      const formatted = adapter.formatScopes(scopes);

      expect(formatted).toEqual(['patient/DocumentReference.ws', 'patient/MedicationRequest.ws']);
    });

    it('preserves scopes without .read or .write', () => {
      const scopes = ['launch', 'openid', 'fhirUser', 'offline_access'];
      const formatted = adapter.formatScopes(scopes);

      expect(formatted).toEqual(scopes);
    });

    it('handles mixed scopes', () => {
      const scopes = [
        'launch',
        'patient/Patient.read',
        'openid',
        'patient/DocumentReference.write',
      ];
      const formatted = adapter.formatScopes(scopes);

      expect(formatted).toEqual([
        'launch',
        'patient/Patient.rs',
        'openid',
        'patient/DocumentReference.ws',
      ]);
    });
  });

  describe('handleError', () => {
    it('handles scope denial errors', () => {
      const error = new Error('Scope denied by user');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('additional scope approval');
    });

    it('handles forbidden errors', () => {
      const error = new Error('403 Forbidden');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('Epic App Orchard');
    });

    it('handles rate limit errors', () => {
      const error = new Error('Rate limit exceeded');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('100 requests/minute');
    });

    it('preserves other errors', () => {
      const error = new Error('Network timeout');
      const handled = adapter.handleError(error);

      expect(handled.message).toBe('Network timeout');
    });
  });
});

describe('CernerAdapter', () => {
  const adapter = new CernerAdapter();

  it('has correct name', () => {
    expect(adapter.name).toBe('cerner');
  });

  describe('formatScopes', () => {
    it('preserves scopes unchanged', () => {
      const scopes = ['patient/Patient.read', 'patient/Observation.read', 'patient/Condition.read'];
      const formatted = adapter.formatScopes(scopes);

      expect(formatted).toEqual(scopes);
    });
  });

  describe('handleError', () => {
    it('handles tenant errors', () => {
      const error = new Error('Invalid tenant configuration');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('tenant');
    });

    it('handles DSTU2 errors', () => {
      const error = new Error('DSTU2 not supported');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('FHIR DSTU2');
    });

    it('handles validation errors', () => {
      const error = new Error('FHIR validation failed');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('validation');
    });
  });

  describe('getWriteHeaders', () => {
    it('returns correct headers', () => {
      const headers = adapter.getWriteHeaders();

      expect(headers).toEqual({
        'Content-Type': 'application/fhir+json',
        Accept: 'application/fhir+json',
        Prefer: 'return=representation',
      });
    });
  });
});

describe('AthenaAdapter', () => {
  const adapter = new AthenaAdapter();

  it('has correct name', () => {
    expect(adapter.name).toBe('athena');
  });

  describe('formatScopes', () => {
    it('preserves scopes unchanged', () => {
      const scopes = ['patient/Patient.read', 'patient/Observation.read', 'patient/Condition.read'];
      const formatted = adapter.formatScopes(scopes);

      expect(formatted).toEqual(scopes);
    });
  });

  describe('handleError', () => {
    it('handles practice errors', () => {
      const error = new Error('Invalid practice ID');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('practice');
    });

    it('handles marketplace errors', () => {
      const error = new Error('Marketplace registration required');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('marketplace');
    });

    it('handles rate limit errors', () => {
      const error = new Error('Rate limit 429');
      const handled = adapter.handleError(error);

      expect(handled.message).toContain('10 requests/second');
    });
  });
});
