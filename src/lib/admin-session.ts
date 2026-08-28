export const ADMIN_COOKIE = "pc_adm";
const TTL_SECONDS = 60 * 60 * 24 * 7;

function adminSecret(): string {
  return process.env.ADMIN_SECRET_KEY || process.env.ADMIN_SECRET || "";
}

async function hmacHex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export async function signAdminSession(): Promise<string | null> {
  const secret = adminSecret();
  if (!secret) return null;
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const sig = await hmacHex(secret, `v1.${exp}`);
  return `${exp}.${sig}`;
}

export async function verifyAdminSession(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  const secret = adminSecret();
  if (!secret) return false;
  const [expStr, sig] = value.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(secret, `v1.${expStr}`);
  return timingSafeEqual(sig, expected);
}

export const ADMIN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "strict" as const,
  path: "/",
  maxAge: TTL_SECONDS,
};
