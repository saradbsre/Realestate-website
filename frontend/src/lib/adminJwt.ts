import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_TOKEN_COOKIE = "admin_token";
export const ADMIN_TOKEN_MAX_AGE = 60 * 60 * 8;

type AdminTokenPayload = {
  sub: string;
  role: "Super Admin";
  iat: number;
  exp: number;
};

const encode = (value: string) => Buffer.from(value).toString("base64url");

function getSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;

  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "local-development-only-change-with-admin-jwt-secret";
  }

  throw new Error("ADMIN_JWT_SECRET is not configured.");
}

function signature(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createAdminToken(username: string) {
  const now = Math.floor(Date.now() / 1000);
  const header = encode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payload = encode(
    JSON.stringify({
      sub: username,
      role: "Super Admin",
      iat: now,
      exp: now + ADMIN_TOKEN_MAX_AGE,
    } satisfies AdminTokenPayload)
  );
  const unsignedToken = `${header}.${payload}`;

  return `${unsignedToken}.${signature(unsignedToken)}`;
}

export function verifyAdminToken(token: string | undefined): AdminTokenPayload | null {
  if (!token) return null;

  try {
    const [header, payload, suppliedSignature, extra] = token.split(".");
    if (!header || !payload || !suppliedSignature || extra) return null;

    const expectedSignature = signature(`${header}.${payload}`);
    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);
    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as Partial<AdminTokenPayload>;
    const now = Math.floor(Date.now() / 1000);

    if (
      typeof decoded.sub !== "string" ||
      decoded.role !== "Super Admin" ||
      typeof decoded.iat !== "number" ||
      typeof decoded.exp !== "number" ||
      decoded.exp <= now
    ) {
      return null;
    }

    return decoded as AdminTokenPayload;
  } catch {
    return null;
  }
}
