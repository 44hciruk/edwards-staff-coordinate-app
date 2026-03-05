import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { ONE_YEAR_MS } from "@shared/const";

type AdminUser = { email: string; password: string; name: string };

function getAdminUsers(): AdminUser[] {
  // process.env を呼び出し時点で読む（モジュール初期化タイミング問題を回避）
  const raw = process.env.ADMIN_USERS ?? "[]";
  try {
    return JSON.parse(raw) as AdminUser[];
  } catch {
    console.error("[adminAuth] Failed to parse ADMIN_USERS env var");
    return [];
  }
}

function getSecret(): Uint8Array {
  return new TextEncoder().encode(process.env.JWT_SECRET ?? "change-me");
}

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<{ email: string; name: string } | null> {
  const admins = getAdminUsers();
  const admin = admins.find((u) => u.email === email);
  if (!admin) return null;

  let match = false;
  if (admin.password.startsWith("$2")) {
    match = await bcrypt.compare(password, admin.password);
  } else {
    match = password === admin.password;
  }

  if (!match) return null;
  return { email: admin.email, name: admin.name };
}

export async function createAdminToken(email: string, name: string): Promise<string> {
  const secret = getSecret();
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ email, name, role: "admin" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secret);
}
