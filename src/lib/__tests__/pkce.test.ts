import { describe, expect, it } from 'vitest';
import { generatePKCEChallenge, verifyPKCEChallenge } from '../pkce';

describe('pkce', () => {
  describe('generatePKCEChallenge', () => {
    it('should generate a PKCE challenge', async () => {
      const result = await generatePKCEChallenge();

      expect(result).toHaveProperty('codeVerifier');
      expect(result).toHaveProperty('codeChallenge');
      expect(result.codeVerifier).toBeTruthy();
      expect(result.codeChallenge).toBeTruthy();
    });

    it('should generate different challenges on subsequent calls', async () => {
      const result1 = await generatePKCEChallenge();
      const result2 = await generatePKCEChallenge();

      expect(result1.codeVerifier).not.toBe(result2.codeVerifier);
      expect(result1.codeChallenge).not.toBe(result2.codeChallenge);
    });
  });

  describe('verifyPKCEChallenge', () => {
    it('should verify a valid PKCE challenge', async () => {
      const { codeVerifier, codeChallenge } = await generatePKCEChallenge();
      const isValid = await verifyPKCEChallenge(codeVerifier, codeChallenge);

      expect(isValid).toBe(true);
    });

    it('should reject an invalid PKCE challenge', async () => {
      const { codeVerifier } = await generatePKCEChallenge();
      const isValid = await verifyPKCEChallenge(codeVerifier, 'invalid-challenge');

      expect(isValid).toBe(false);
    });
  });
});
