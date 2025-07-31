import Config from "../../../config.json";

/**
 * Generates a cryptographically random code verifier for PKCE flow
 * @returns A 64-character hexadecimal string (within OAuth 2.0 43-128 character range)
 */
function generateRandomCodeVerifier(): string {
  const array = new Uint8Array(32);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    ""
  );
}

/**
 * Retrieves the PKCE code verifier from storage or generates a new one
 * @returns The code verifier string
 */
export function getOrCreateCodeVerifier(): string {
  const codeVerifier = localStorage.getItem(Config.STORAGE_KEYS.CODE_VERIFIER);
  if (codeVerifier) {
    return codeVerifier;
  }
  const generatedCodeVerifier = generateRandomCodeVerifier();
  localStorage.setItem(
    Config.STORAGE_KEYS.CODE_VERIFIER,
    generatedCodeVerifier
  );
  return generatedCodeVerifier;
}

/**
 * Computes SHA-256 hash of the input string
 * @param plain The string to hash
 * @returns Promise resolving to the hash as ArrayBuffer
 */
function computeSHA256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

/**
 * Converts ArrayBuffer to base64url encoding (RFC 4648)
 * @param buffer The ArrayBuffer to encode
 * @returns Base64url encoded string
 */
function base64UrlEncode(buffer: ArrayBuffer): string {
  let str = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Generates PKCE code challenge from verifier using S256 method
 * @param verifier The code verifier string
 * @returns Promise resolving to the code challenge
 */
async function generateCodeChallengeFromVerifier(
  verifier: string
): Promise<string> {
  const hashed = await computeSHA256(verifier);
  const base64encoded = base64UrlEncode(hashed);
  return base64encoded;
}

/**
 * Gets or generates the PKCE code challenge for the current auth flow
 * @returns Promise resolving to the code challenge string
 * @throws Error if code challenge generation fails
 */
export async function generateCodeChallenge(): Promise<string> {
  try {
    const codeVerifier = getOrCreateCodeVerifier();
    const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier);
    return codeChallenge;
  } catch (e) {
    console.error("Failed to generate code challenge:", e);
    throw new Error("Error generating code challenge");
  }
}
