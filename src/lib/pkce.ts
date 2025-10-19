import type { PKCEChallenge } from '@/types';

/**
 * Generate a cryptographically random code verifier
 */
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64URLEncode(array);
}

/**
 * Generate a code challenge from a code verifier using SHA-256
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64URLEncode(new Uint8Array(hash));
}

/**
 * Base64 URL encode without padding
 */
function base64URLEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Generate PKCE challenge pair
 */
export async function generatePKCEChallenge(): Promise<PKCEChallenge> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Verify a code verifier against a challenge (for testing purposes)
 */
export async function verifyPKCEChallenge(
  codeVerifier: string,
  codeChallenge: string
): Promise<boolean> {
  const computedChallenge = await generateCodeChallenge(codeVerifier);
  return computedChallenge === codeChallenge;
}
