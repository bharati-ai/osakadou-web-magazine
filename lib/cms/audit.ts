import { db } from "./db";

export type AuditRow = { id: number; at: string; actor_id: number | null; actor: string; action: string; target_id: number | null; target: string; detail: string };

// ponytail: kept forever (rows are tiny); prune by date if the table ever grows large.
/** Record a security-relevant action: sign-ins and every change to users and their access. */
export function audit(actor: { id: number; name: string } | null, action: string, target?: { id?: number | null; name?: string }, detail = "") {
  db()
    .prepare("INSERT INTO audit_log (actor_id, actor, action, target_id, target, detail) VALUES (?, ?, ?, ?, ?, ?)")
    .run(actor?.id ?? null, actor?.name ?? "", action, target?.id ?? null, target?.name ?? "", detail.slice(0, 300));
}

export function auditLog(f: { userId?: number; limit?: number } = {}) {
  const where = f.userId ? "WHERE target_id = ? OR actor_id = ?" : "";
  const args = f.userId ? [f.userId, f.userId] : [];
  return db().prepare(`SELECT * FROM audit_log ${where} ORDER BY id DESC LIMIT ?`).all(...args, f.limit ?? 50) as AuditRow[];
}
