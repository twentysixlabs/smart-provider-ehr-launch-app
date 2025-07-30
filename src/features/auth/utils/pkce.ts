import Config from "../../../config.json";

function dec2hex(dec: number) {
  return dec.toString(16).padStart(2, "0");
}

function generateCodeVerifier() {
  const array = new Uint32Array(56 / 2);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec2hex).join("");
}

export function getCodeVerifier() {
  const codeVerifier = localStorage.getItem(Config.STORAGE_KEYS.CODE_VERIFIER);
  if (codeVerifier) {
    return codeVerifier;
  }
  const generatedCodeVerifier = generateCodeVerifier();
  localStorage.setItem(
    Config.STORAGE_KEYS.CODE_VERIFIER,
    generatedCodeVerifier
  );
  return generatedCodeVerifier;
}

// GENERATING CODE CHALLENGE FROM VERIFIER
function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlencode(a: ArrayBuffer) {
  let str = "";
  const bytes = new Uint8Array(a);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallengeFromVerifier(v: string) {
  const hashed = await sha256(v);
  const base64encoded = base64urlencode(hashed);
  return base64encoded;
}

export async function getCodeChallenge() {
  try {
    const codeVerifier = getCodeVerifier();
    const codeChallenge = await generateCodeChallengeFromVerifier(codeVerifier);
    return codeChallenge;
  } catch (e) {
    console.log(e);
    throw new Error("Error generating code challenge");
  }
}
