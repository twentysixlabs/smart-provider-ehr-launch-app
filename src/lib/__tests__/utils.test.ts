import { describe, expect, it } from 'vitest';
import {
  cn,
  formatDate,
  formatDateShort,
  formatRelativeTime,
  generateRandomString,
  getNestedValue,
  safeJsonParse,
} from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('should merge class names correctly', () => {
      const result = cn('px-4 py-2', 'bg-blue-500', 'text-white');
      expect(result).toBe('px-4 py-2 bg-blue-500 text-white');
    });

    it('should handle conditional classes', () => {
      const result = cn('base-class', false, 'visible');
      expect(result).toBe('base-class visible');
    });
  });

  describe('formatDate', () => {
    it('should format a date string', () => {
      const result = formatDate('2024-01-15');
      expect(result).toContain('2024');
      expect(result).toContain('January');
    });

    it('should handle undefined', () => {
      expect(formatDate(undefined)).toBe('N/A');
    });

    it('should handle invalid dates', () => {
      expect(formatDate('invalid')).toBe('Invalid date');
    });
  });

  describe('formatDateShort', () => {
    it('should format a date string in short format', () => {
      const result = formatDateShort('2024-01-15');
      expect(result).toContain('2024');
      expect(result).toContain('Jan');
    });

    it('should handle undefined', () => {
      expect(formatDateShort(undefined)).toBe('N/A');
    });
  });

  describe('formatRelativeTime', () => {
    it('should format time as "Just now" for very recent dates', () => {
      const now = new Date();
      expect(formatRelativeTime(now)).toBe('Just now');
    });

    it('should handle undefined', () => {
      expect(formatRelativeTime(undefined)).toBe('N/A');
    });
  });

  describe('safeJsonParse', () => {
    it('should parse valid JSON', () => {
      const result = safeJsonParse<{ name: string }>('{"name":"John"}', { name: 'Default' });
      expect(result).toEqual({ name: 'John' });
    });

    it('should return fallback for invalid JSON', () => {
      const result = safeJsonParse<{ name: string }>('invalid json', { name: 'Default' });
      expect(result).toEqual({ name: 'Default' });
    });
  });

  describe('generateRandomString', () => {
    it('should generate a random string of specified length', () => {
      const result = generateRandomString(16);
      expect(result).toHaveLength(32); // Each byte becomes 2 hex characters
    });

    it('should generate different strings on subsequent calls', () => {
      const result1 = generateRandomString(16);
      const result2 = generateRandomString(16);
      expect(result1).not.toBe(result2);
    });
  });

  describe('getNestedValue', () => {
    it('should get nested value from object', () => {
      const obj = { user: { name: 'John', age: 30 } };
      expect(getNestedValue(obj, 'user.name', 'Default')).toBe('John');
    });

    it('should return default value for non-existent path', () => {
      const obj = { user: { name: 'John' } };
      expect(getNestedValue(obj, 'user.email', 'No email')).toBe('No email');
    });

    it('should handle deep nesting', () => {
      const obj = { a: { b: { c: { d: 'value' } } } };
      expect(getNestedValue(obj, 'a.b.c.d', 'Default')).toBe('value');
    });
  });
});
