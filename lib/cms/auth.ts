import crypto from "node:crypto";
import { pick, type L as Tr } from "@/lib/admin-i18n";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { audit } from "./audit";
import { db, nowIso } from "./db";
import { can, type Perm, type Role } from "./perms";

export type { Role } from "./perms";
export type User = {
  id: number; email: string; name: string; role: Role; perms: string | null; note: string; active: number; must_change_password: number;
  password_changed_at: string | null; created_at: string; last_login_at: string | null;
};
export const USER_COLS = "id, email, name, role, perms, note, active, must_change_password, password_changed_at, created_at, last_login_at";

export const SESSION_COOKIE = "ol_session";
/** Non-secret hint so static public pages know to load the admin bar. */
export const HINT_COOKIE = "ol_admin";
const SESSION_DAYS = 14;
const SCRYPT = { N: 16384, r: 8, p: 1 };

export const sha256 = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(pw, salt, 64, SCRYPT);
  return `scrypt$${SCRYPT.N}$${SCRYPT.r}$${SCRYPT.p}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(pw: string, stored: string) {
  const [alg, N, r, p, salt, hash] = stored.split("$");
  if (alg !== "scrypt") return false;
  const want = Buffer.from(hash, "base64");
  const got = crypto.scryptSync(pw, Buffer.from(salt, "base64"), want.length, { N: +N, r: +r, p: +p });
  return crypto.timingSafeEqual(want, got);
}

export function passwordProblem(pw: string, L: Tr = pick("ja")) {
  if (pw.length < 12) return L("パスワードは12文字以上にしてください。", "Use at least 12 characters for the password.");
  if (pw.length > 200) return L("パスワードが長すぎます。", "That password is too long.");
  return null;
}

// ponytail: in-memory login throttle, per process. Move to a shared store if you run several instances.
// Two counters: per IP+email (5 tries), and per email alone (10 tries) so a spoofed X-Forwarded-For cannot reset it.
const fails = new Map<string, { n: number; until: number }>();
const LIMITS = { ip: 5, email: 10 };
const LOCK_MS = 15 * 60_000;
// Computed once: unknown emails then cost the same single scrypt as known ones (no timing oracle).
let dummyHash: string | undefined;

const keys = (email: string, ip: string) => ({ ip: `ip|${ip}|${email.toLowerCase()}`, email: `email|${email.toLowerCase()}` });
const hit = (k: string, limit: number) => {
  const f = fails.get(k);
  return !!f && f.n >= limit && f.until > Date.now();
};

export function loginLocked(email: string, ip: string) {
  const k = keys(email, ip);
  return hit(k.ip, LIMITS.ip) || hit(k.email, LIMITS.email);
}

export async function login(email: string, password: string, ip: string): Promise<User | null> {
  const k = keys(email, ip);
  const row = db().prepare("SELECT * FROM users WHERE email = ? AND active = 1").get(email) as (User & { password_hash: string }) | undefined;
  dummyHash ??= hashPassword("x".repeat(16));
  const ok = verifyPassword(password, row?.password_hash ?? dummyHash) && !!row;
  if (!ok) {
    if (row) audit(null, "login_failed", { id: row.id, name: row.email }, ip === "direct" ? "" : ip);
    for (const key of [k.ip, k.email]) {
      const f = fails.get(key);
      fails.set(key, { n: (f && f.until > Date.now() ? f.n : 0) + 1, until: Date.now() + LOCK_MS });
    }
    return null;
  }
  fails.delete(k.ip);
  fails.delete(k.email);
  db().prepare("UPDATE users SET last_login_at = ? WHERE id = ?").run(nowIso(), row.id);
  audit({ id: row.id, name: row.name }, "login", { id: row.id, name: row.email }, ip === "direct" ? "" : ip);
  return row;
}

export async function startSession(userId: number) {
  const token = crypto.randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const d = db();
  d.prepare("DELETE FROM sessions WHERE expires_at < ?").run(nowIso());
  d.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(sha256(token), userId, expires.toISOString());
  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  jar.set(SESSION_COOKIE, token, { httpOnly: true, secure, sameSite: "lax", path: "/", expires });
  jar.set(HINT_COOKIE, "1", { httpOnly: false, secure, sameSite: "lax", path: "/", expires });
}

export async function endSession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) db().prepare("DELETE FROM sessions WHERE token_hash = ?").run(sha256(token));
  jar.delete(SESSION_COOKIE);
  jar.delete(HINT_COOKIE);
}

/** The signed-in user for this request, or null. */
export const currentUser = cache(async (): Promise<User | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = db()
    .prepare(
      `SELECT ${USER_COLS.split(", ").map((c) => `u.${c}`).join(", ")} FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ? AND u.active = 1`,
    )
    .get(sha256(token), nowIso()) as User | undefined;
  return row ?? null;
});

/**
 * Use in admin pages and server actions. Redirects to login, to the forced password change,
 * or back to the dashboard when the user lacks the permission ("admin" = the admin role).
 */
export async function requireUser(need?: Perm | "admin", opts: { pendingOk?: boolean } = {}): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (u.must_change_password && !opts.pendingOk) redirect("/admin/password");
  if (need && !can(u, need)) redirect("/admin?denied=1");
  return u;
}

/** Forwarded headers are client-controlled unless a proxy you run overwrites them: set TRUST_PROXY=1 only then. */
export async function clientIp() {
  if (process.env.TRUST_PROXY !== "1") return "direct";
  const h = await headers();
  return (h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",").pop() ?? "unknown").trim();
}

export function createUser(input: { email: string; name: string; role: Role; password: string; perms?: string | null; note?: string; mustChange?: boolean }) {
  return Number(
    db()
      .prepare("INSERT INTO users (email, name, role, perms, note, password_hash, must_change_password) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(input.email.trim(), input.name.trim(), input.role, input.perms ?? null, input.note?.trim() ?? "", hashPassword(input.password), input.mustChange ? 1 : 0).lastInsertRowid,
  );
}

export function userById(id: number) {
  return db().prepare(`SELECT ${USER_COLS} FROM users WHERE id = ?`).get(id) as User | undefined;
}

/** Active admins other than `exceptId`: the last one cannot be demoted, deactivated or deleted. */
export const otherAdmins = (exceptId: number) =>
  (db().prepare("SELECT count(*) n FROM users WHERE role = 'admin' AND active = 1 AND id != ?").get(exceptId) as { n: number }).n;

export const activeSessions = (userId: number) =>
  (db().prepare("SELECT count(*) n FROM sessions WHERE user_id = ? AND expires_at > ?").get(userId, nowIso()) as { n: number }).n;

/** Sign a user out everywhere (optionally keeping the session making this request). */
export async function revokeSessions(userId: number, keepCurrent = false) {
  const token = keepCurrent ? (await cookies()).get(SESSION_COOKIE)?.value : undefined;
  db().prepare("DELETE FROM sessions WHERE user_id = ? AND token_hash != ?").run(userId, token ? sha256(token) : "");
}
