import type { CodeableConcept, HumanName, Patient } from '@medplum/fhirtypes';
import { describe, expect, it } from 'vitest';
import {
  buildFhirSearchUrl,
  extractResourceId,
  formatCodeableConcept,
  formatGender,
  formatHumanName,
  formatPatientName,
  getPatientAge,
  roundToTwoDecimalsOrInteger,
} from '../fhir-utils';

describe('fhir-utils', () => {
  describe('formatPatientName', () => {
    it('should format patient name correctly', () => {
      const patient: Patient = {
        resourceType: 'Patient',
        name: [
          {
            given: ['John'],
            family: 'Doe',
          },
        ],
      };
      expect(formatPatientName(patient)).toBe('John Doe');
    });

    it('should handle patient with no name', () => {
      const patient: Patient = {
        resourceType: 'Patient',
      };
      expect(formatPatientName(patient)).toBe('Unknown Patient');
    });

    it('should handle null patient', () => {
      expect(formatPatientName(null)).toBe('Unknown Patient');
    });
  });

  describe('formatHumanName', () => {
    it('should use text if available', () => {
      const name: HumanName = {
        text: 'Dr. John Doe Jr.',
      };
      expect(formatHumanName(name)).toBe('Dr. John Doe Jr.');
    });

    it('should construct name from parts', () => {
      const name: HumanName = {
        prefix: ['Dr.'],
        given: ['John', 'Michael'],
        family: 'Doe',
        suffix: ['Jr.'],
      };
      expect(formatHumanName(name)).toBe('Dr. John Michael Doe Jr.');
    });

    it('should handle undefined name', () => {
      expect(formatHumanName(undefined)).toBe('Unknown');
    });
  });

  describe('formatCodeableConcept', () => {
    it('should use text if available', () => {
      const concept: CodeableConcept = {
        text: 'Blood Pressure',
      };
      expect(formatCodeableConcept(concept)).toBe('Blood Pressure');
    });

    it('should use coding display if text not available', () => {
      const concept: CodeableConcept = {
        coding: [
          {
            system: 'http://loinc.org',
            code: '85354-9',
            display: 'Blood pressure panel',
          },
        ],
      };
      expect(formatCodeableConcept(concept)).toBe('Blood pressure panel');
    });

    it('should handle undefined concept', () => {
      expect(formatCodeableConcept(undefined)).toBe('Unknown');
    });
  });

  describe('getPatientAge', () => {
    it('should calculate age correctly', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 30);
      const patient: Patient = {
        resourceType: 'Patient',
        birthDate: birthDate.toISOString().split('T')[0],
      };
      expect(getPatientAge(patient)).toBe('30');
    });

    it('should handle patient with no birth date', () => {
      const patient: Patient = {
        resourceType: 'Patient',
      };
      expect(getPatientAge(patient)).toBe('Unknown');
    });
  });

  describe('formatGender', () => {
    it('should format male gender', () => {
      expect(formatGender('male')).toBe('Male');
    });

    it('should format female gender', () => {
      expect(formatGender('female')).toBe('Female');
    });

    it('should handle undefined gender', () => {
      expect(formatGender(undefined)).toBe('Unknown');
    });

    it('should handle unknown gender value', () => {
      expect(formatGender('other')).toBe('Other');
    });
  });

  describe('roundToTwoDecimalsOrInteger', () => {
    it('should return integer when value has no decimals', () => {
      expect(roundToTwoDecimalsOrInteger(5.0)).toBe(5);
    });

    it('should round to two decimal places', () => {
      expect(roundToTwoDecimalsOrInteger(5.456)).toBe(5.46);
    });

    it('should handle single decimal', () => {
      expect(roundToTwoDecimalsOrInteger(5.1)).toBe(5.1);
    });
  });

  describe('buildFhirSearchUrl', () => {
    it('should build URL with parameters', () => {
      const url = buildFhirSearchUrl('https://fhir.example.com', 'Patient', {
        _id: '123',
        _count: 10,
      });
      expect(url).toContain('https://fhir.example.com/Patient');
      expect(url).toContain('_id=123');
      expect(url).toContain('_count=10');
    });

    it('should skip undefined parameters', () => {
      const url = buildFhirSearchUrl('https://fhir.example.com', 'Patient', {
        _id: '123',
        name: undefined,
      });
      expect(url).toContain('_id=123');
      expect(url).not.toContain('name');
    });
  });

  describe('extractResourceId', () => {
    it('should extract ID from reference', () => {
      expect(extractResourceId('Patient/123')).toBe('123');
    });

    it('should extract ID from full URL reference', () => {
      expect(extractResourceId('https://fhir.example.com/Patient/123')).toBe('123');
    });

    it('should return null for undefined reference', () => {
      expect(extractResourceId(undefined)).toBeNull();
    });

    it('should return null for invalid reference', () => {
      expect(extractResourceId('invalid')).toBeNull();
    });
  });
});
