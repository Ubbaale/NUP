import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { adminUsers, auditLog, type AdminUser } from "@shared/schema";
import { eq, sql, and, desc } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

export type Role = "super_admin" | "editor" | "viewer";

export const ROLES: Role[] = ["super_admin", "editor", "viewer"];

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const hash = Buffer.from(hashHex, "hex");
  const test = (await scryptAsync(password, salt, 64)) as Buffer;
  if (test.length !== hash.length) return false;
  return timingSafeEqual(hash, test);
}

export async function findUserByUsername(username: string): Promise<AdminUser | null> {
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.username, username)).limit(1);
  return rows[0] || null;
}

export async function findUserById(id: string): Promise<AdminUser | null> {
  const rows = await db.select().from(adminUsers).where(eq(adminUsers.id, id)).limit(1);
  return rows[0] || null;
}

export async function listUsers(): Promise<AdminUser[]> {
  return db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
}

export async function createUser(input: {
  username: string;
  password: string;
  role: Role;
  email?: string | null;
  fullName?: string | null;
  isActive?: boolean;
}): Promise<AdminUser> {
  const passwordHash = await hashPassword(input.password);
  const [row] = await db.insert(adminUsers).values({
    username: input.username,
    passwordHash,
    role: input.role,
    email: input.email ?? null,
    fullName: input.fullName ?? null,
    isActive: input.isActive ?? true,
  }).returning();
  return row;
}

export async function updateUser(id: string, patch: {
  role?: Role;
  email?: string | null;
  fullName?: string | null;
  isActive?: boolean;
  password?: string;
}): Promise<AdminUser | null> {
  const updates: Record<string, any> = {};
  if (patch.role !== undefined) updates.role = patch.role;
  if (patch.email !== undefined) updates.email = patch.email;
  if (patch.fullName !== undefined) updates.fullName = patch.fullName;
  if (patch.isActive !== undefined) updates.isActive = patch.isActive;
  if (patch.password) updates.passwordHash = await hashPassword(patch.password);
  if (Object.keys(updates).length === 0) return findUserById(id);
  const [row] = await db.update(adminUsers).set(updates).where(eq(adminUsers.id, id)).returning();
  return row || null;
}

export async function deleteUser(id: string): Promise<boolean> {
  const result = await db.delete(adminUsers).where(eq(adminUsers.id, id)).returning();
  return result.length > 0;
}

export async function recordLogin(userId: string): Promise<void> {
  await db.update(adminUsers).set({ lastLoginAt: new Date() }).where(eq(adminUsers.id, userId));
}

export async function countUsers(): Promise<number> {
  const r = await db.select({ c: sql<number>`count(*)::int` }).from(adminUsers);
  return r[0]?.c || 0;
}

export async function countSuperAdmins(): Promise<number> {
  const r = await db.select({ c: sql<number>`count(*)::int` })
    .from(adminUsers)
    .where(and(eq(adminUsers.role, "super_admin"), eq(adminUsers.isActive, true)));
  return r[0]?.c || 0;
}

// Bootstrap: create a super_admin from env vars on first run if no users exist
export async function bootstrapSuperAdmin(): Promise<void> {
  try {
    const count = await countUsers();
    if (count > 0) return;
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) {
      console.warn("[admin] No admin users exist and ADMIN_USERNAME/ADMIN_PASSWORD env vars not set — admin login will be unavailable.");
      return;
    }
    await createUser({ username, password, role: "super_admin", fullName: "Super Admin (bootstrapped from env)" });
    console.log(`[admin] Bootstrapped initial super admin user "${username}" from environment variables.`);
  } catch (e) {
    console.error("[admin] Failed to bootstrap super admin:", e);
  }
}

// === Middleware ===

export function requireAdmin(req: any, res: any, next: any) {
  if (req.session && req.session.adminUserId) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

export function requireRole(...allowed: Role[]) {
  return (req: any, res: any, next: any) => {
    if (!req.session || !req.session.adminUserId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const role = req.session.adminRole as Role | undefined;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ error: "Forbidden — insufficient role" });
    }
    next();
  };
}

// Audit log middleware: captures every successful mutating admin action
const SENSITIVE_KEYS = new Set(["password", "currentPassword", "newPassword", "passwordHash", "token", "secret"]);

function redactSensitive(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(redactSensitive);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(k)) {
      out[k] = "[REDACTED]";
    } else if (v && typeof v === "object") {
      out[k] = redactSensitive(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

function summarizeBody(body: any): string | null {
  if (!body || (typeof body === "object" && Object.keys(body).length === 0)) return null;
  try {
    const redacted = redactSensitive(body);
    const str = JSON.stringify(redacted);
    return str.length > 2000 ? str.slice(0, 2000) + "...[truncated]" : str;
  } catch {
    return null;
  }
}

export function auditLogMiddleware(req: any, res: any, next: any) {
  const method = req.method;
  // Only log mutating methods
  if (method !== "POST" && method !== "PATCH" && method !== "PUT" && method !== "DELETE") {
    return next();
  }
  // Only log /api/admin/* and other admin-touched mutations
  if (!req.path.startsWith("/api/")) return next();
  // Skip login/logout from automatic logging (handled separately)
  if (req.path === "/api/admin/login" || req.path === "/api/admin/logout") return next();

  res.on("finish", async () => {
    try {
      // Only log when authenticated as admin AND request succeeded
      if (!req.session || !req.session.adminUserId) return;
      if (res.statusCode >= 400) return;

      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || req.socket?.remoteAddress || null;
      await db.insert(auditLog).values({
        userId: req.session.adminUserId,
        username: req.session.adminUsername || null,
        role: req.session.adminRole || null,
        method,
        path: req.path,
        statusCode: res.statusCode,
        bodyPreview: summarizeBody(req.body),
        ipAddress: ip ? String(ip).slice(0, 100) : null,
        userAgent: req.headers["user-agent"] ? String(req.headers["user-agent"]).slice(0, 300) : null,
      });
    } catch (e) {
      console.error("[audit] Failed to record audit entry:", e);
    }
  });

  next();
}

export async function listAuditEntries(opts: { limit?: number; offset?: number; userId?: string } = {}) {
  const limit = Math.min(opts.limit ?? 100, 500);
  const offset = opts.offset ?? 0;
  const q = db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(limit).offset(offset);
  if (opts.userId) {
    return db.select().from(auditLog).where(eq(auditLog.userId, opts.userId)).orderBy(desc(auditLog.createdAt)).limit(limit).offset(offset);
  }
  return q;
}

export async function recordManualAuditEntry(entry: {
  userId?: string | null;
  username?: string | null;
  role?: string | null;
  method: string;
  path: string;
  statusCode?: number;
  bodyPreview?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  try {
    await db.insert(auditLog).values({
      userId: entry.userId ?? null,
      username: entry.username ?? null,
      role: entry.role ?? null,
      method: entry.method,
      path: entry.path,
      statusCode: entry.statusCode ?? null,
      bodyPreview: entry.bodyPreview ?? null,
      ipAddress: entry.ipAddress ?? null,
      userAgent: entry.userAgent ?? null,
    });
  } catch (e) {
    console.error("[audit] Failed to record manual audit entry:", e);
  }
}
