export interface AuthEnv {
  DB: D1Database;
  READER_PASSWORD?: string;
  SESSION_SECRET?: string;
  SYNC_TOKEN?: string;
}

const COOKIE_NAME = "inkos_reader_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const encoder = new TextEncoder();

export async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const viewA = new Uint8Array(hashA);
  const viewB = new Uint8Array(hashB);
  if (viewA.byteLength !== viewB.byteLength) return false;
  let diff = 0;
  for (let i = 0; i < viewA.byteLength; i++) {
    diff |= viewA[i] ^ viewB[i];
  }
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array | null {
  try {
    const padded = str.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((str.length + 3) % 4);
    const binary = atob(padded);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      out[i] = binary.charCodeAt(i);
    }
    return out;
  } catch {
    return null;
  }
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionCookie(secret: string, secure: boolean): Promise<string> {
  const payload = JSON.stringify({
    v: 1,
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    nonce: crypto.randomUUID(),
  });
  const payloadB64 = toBase64Url(encoder.encode(payload));
  const key = await getHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sigB64 = toBase64Url(new Uint8Array(sig));
  const token = `${payloadB64}.${sigB64}`;
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  const secureFlag = secure ? "; Secure" : "";
  return `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secureFlag}`;
}

export function clearSessionCookie(secure: boolean): string {
  const secureFlag = secure ? "; Secure" : "";
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secureFlag}`;
}

export async function verifySessionRequest(request: Request, env: AuthEnv): Promise<boolean> {
  const secret = env.SESSION_SECRET || env.READER_PASSWORD || "";
  if (!secret) return false;

  // Check Bearer token first (for CLI / background auto-sync daemon)
  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const providedToken = authHeader.slice(7).trim();
    const expectedSync = env.SYNC_TOKEN || env.READER_PASSWORD || "";
    if (expectedSync && (await timingSafeEqualStrings(providedToken, expectedSync))) {
      return true;
    }
  }

  // Check Cookie
  const cookieHeader = request.headers.get("Cookie");
  if (!cookieHeader) return false;

  let token = "";
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_NAME) {
      token = rest.join("=");
      break;
    }
  }
  if (!token) return false;

  const dotIdx = token.indexOf(".");
  if (dotIdx <= 0) return false;
  const payloadB64 = token.slice(0, dotIdx);
  const sigB64 = token.slice(dotIdx + 1);

  const sigBytes = fromBase64Url(sigB64);
  if (!sigBytes) return false;

  const key = await getHmacKey(secret);
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    sigBytes.buffer as ArrayBuffer,
    encoder.encode(payloadB64)
  );
  if (!valid) return false;

  const payloadBytes = fromBase64Url(payloadB64);
  if (!payloadBytes) return false;

  try {
    const data = JSON.parse(new TextDecoder().decode(payloadBytes)) as { exp?: number };
    if (!data.exp || Date.now() > data.exp) return false;
    return true;
  } catch {
    return false;
  }
}
