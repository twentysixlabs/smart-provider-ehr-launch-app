import Config from "../../../config.json";

/**
 * Gets or generates a cryptographically secure OAuth state parameter for CSRF protection
 * @returns A 32-character hexadecimal string (128 bits of entropy)
 */
export function getOrCreateOAuthState(): string {
  const state = localStorage.getItem(Config.STORAGE_KEYS.OAUTH_STATE);
  if (state) {
    return state;
  }
  const randBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(randBytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  localStorage.setItem(Config.STORAGE_KEYS.OAUTH_STATE, hex);
  return hex;
}
