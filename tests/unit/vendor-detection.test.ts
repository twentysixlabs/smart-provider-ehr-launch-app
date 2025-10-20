/**
 * Vendor Detection Tests
 */

import { describe, it, expect } from 'vitest';
import {
  detectVendor,
  getVendorAdapter,
  getVendorDisplayName,
} from '@/lib/vendor-detection';
import { EpicAdapter } from '@/lib/vendors/epic-adapter';
import { CernerAdapter } from '@/lib/vendors/cerner-adapter';
import { AthenaAdapter } from '@/lib/vendors/athena-adapter';

describe('detectVendor', () => {
  it('detects Epic from ISS URL', () => {
    expect(detectVendor('https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4')).toBe('epic');
    expect(detectVendor('https://epiccare.org/fhir/r4')).toBe('epic');
    expect(detectVendor('https://hospital.com/epic/fhir')).toBe('epic');
  });

  it('detects Cerner from ISS URL', () => {
    expect(detectVendor('https://fhir-myrecord.cerner.com/r4/ec2458f2-1e24-41c8-b71b-0e701af7583d/fhir')).toBe('cerner');
    expect(detectVendor('https://cernercare.com/fhir/r4')).toBe('cerner');
    expect(detectVendor('https://oracle.com/health/fhir')).toBe('cerner');
  });

  it('detects Athena from ISS URL', () => {
    expect(detectVendor('https://api.athenahealth.com/fhir/r4/12345')).toBe('athena');
    expect(detectVendor('https://athenanet.athenahealth.com/fhir')).toBe('athena');
  });

  it('returns unknown for unrecognized URLs', () => {
    expect(detectVendor('https://example.com/fhir')).toBe('unknown');
    expect(detectVendor('https://allscripts.com/fhir')).toBe('unknown');
  });

  it('handles empty or invalid input', () => {
    expect(detectVendor('')).toBe('unknown');
    expect(detectVendor(null as unknown as string)).toBe('unknown');
    expect(detectVendor(undefined as unknown as string)).toBe('unknown');
  });

  it('is case-insensitive', () => {
    expect(detectVendor('HTTPS://FHIR.EPIC.COM/API')).toBe('epic');
    expect(detectVendor('HTTPS://CERNER.COM/FHIR')).toBe('cerner');
  });
});

describe('getVendorAdapter', () => {
  it('returns EpicAdapter for Epic', () => {
    const adapter = getVendorAdapter('epic');
    expect(adapter).toBeInstanceOf(EpicAdapter);
    expect(adapter.name).toBe('epic');
  });

  it('returns CernerAdapter for Cerner', () => {
    const adapter = getVendorAdapter('cerner');
    expect(adapter).toBeInstanceOf(CernerAdapter);
    expect(adapter.name).toBe('cerner');
  });

  it('returns AthenaAdapter for Athena', () => {
    const adapter = getVendorAdapter('athena');
    expect(adapter).toBeInstanceOf(AthenaAdapter);
    expect(adapter.name).toBe('athena');
  });

  it('throws error for unknown vendor', () => {
    expect(() => getVendorAdapter('unknown')).toThrow('Unsupported vendor: unknown');
  });
});

describe('getVendorDisplayName', () => {
  it('returns correct display names', () => {
    expect(getVendorDisplayName('epic')).toBe('Epic');
    expect(getVendorDisplayName('cerner')).toBe('Cerner / Oracle Health');
    expect(getVendorDisplayName('athena')).toBe('Athena Health');
    expect(getVendorDisplayName('unknown')).toBe('Unknown EHR');
  });
});
