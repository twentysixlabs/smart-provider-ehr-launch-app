import Config from "../../../config.json";

export function getOAuth2State() {
  const state = localStorage.getItem(Config.STORAGE_KEYS.OAUTH_STATE);
  if (state) {
    return state;
  }
  const randBytes = window.crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(randBytes, (byte) =>
    byte.toString(16).padStart(2, "0")
  ).join("");
  localStorage.setItem(Config.STORAGE_KEYS.OAUTH_STATE, hex);
  return hex;
}
