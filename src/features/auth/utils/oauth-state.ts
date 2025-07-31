import Config from "../../../config.json";
import type { StorageRepository } from "../../../core/storage/StorageRepository";

/**
 * Gets or generates a cryptographically secure OAuth state parameter for CSRF protection
 * @param storage The storage repository to use
 * @returns A 32-character hexadecimal string (128 bits of entropy)
 */
export function getOrCreateOAuthState(storage: StorageRepository): string {
  const state = storage.getItem(Config.STORAGE_KEYS.OAUTH_STATE);
  if (state) {
    return state;
  }
  const randBytes = window.crypto.getRandomValues(new Uint8Array(16));
  const hex = Array.from(randBytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  storage.setItem(Config.STORAGE_KEYS.OAUTH_STATE, hex);
  return hex;
}
