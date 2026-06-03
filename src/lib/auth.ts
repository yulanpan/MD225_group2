import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { z } from "zod";
import type { GameState, PlayerProfile } from "./types";

export const sessionCookieName = "emperor_feed_session";

export const authCredentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128)
});

export const saveSnapshotSchema: z.ZodType<CloudSaveSnapshot> = z.object({
  version: z.literal(1),
  profile: z.custom<PlayerProfile>((value) => Boolean(value && typeof value === "object")),
  state: z.custom<GameState>((value) => value === null || Boolean(value && typeof value === "object")).nullable(),
  ending: z.string().nullable(),
  finalState: z.custom<GameState>((value) => value === null || Boolean(value && typeof value === "object")).nullable(),
  currentRunId: z.string().nullable(),
  briefingDismissed: z.boolean(),
  guidanceUnlocked: z.boolean(),
  updatedAt: z.string()
});

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  created_at: string;
  last_seen_at: string;
};

type SaveRow = {
  user_id: string;
  save_json: string;
  updated_at: string;
  version: number;
};

export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

export type AuthSession = {
  id: string;
  userId: string;
  expiresAt: string;
};

export type CloudSaveSnapshot = {
  version: 1;
  profile: PlayerProfile;
  state: GameState | null;
  ending: string | null;
  finalState: GameState | null;
  currentRunId: string | null;
  briefingDismissed: boolean;
  guidanceUnlocked: boolean;
  updatedAt: string;
};

let cachedDb: Database.Database | null = null;
let cachedPath: string | null = null;

export function authDatabasePath() {
  if (process.env.AUTH_DB_PATH) return process.env.AUTH_DB_PATH;
  const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
  return path.join(dataDir, "the-emperors-feed.sqlite");
}

export function getAuthDatabase() {
  const databasePath = authDatabasePath();
  if (cachedDb && cachedPath === databasePath) return cachedDb;
  if (cachedDb) cachedDb.close();
  fs.mkdirSync(path.dirname(databasePath), { recursive: true });
  cachedDb = new Database(databasePath);
  cachedPath = databasePath;
  migrateAuthDatabase(cachedDb);
  return cachedDb;
}

export function closeAuthDatabaseForTests() {
  cachedDb?.close();
  cachedDb = null;
  cachedPath = null;
}

function migrateAuthDatabase(db: Database.Database) {
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS player_saves (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      save_json TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      version INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      count INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
  `);
}

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scrypt(password, salt);
  return `scrypt:v1:${salt}:${hash}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, version, salt, expected] = encoded.split(":");
  if (algorithm !== "scrypt" || version !== "v1" || !salt || !expected) return false;
  const actual = await scrypt(password, salt);
  const expectedBuffer = Buffer.from(expected, "hex");
  const actualBuffer = Buffer.from(actual, "hex");
  return expectedBuffer.length === actualBuffer.length && crypto.timingSafeEqual(expectedBuffer, actualBuffer);
}

function scrypt(password: string, salt: string) {
  return new Promise<string>((resolve, reject) => {
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key.toString("hex"));
    });
  });
}

export async function createUser(email: string, password: string) {
  const now = new Date().toISOString();
  const user: AuthUser = { id: crypto.randomUUID(), email, createdAt: now };
  const passwordHash = await hashPassword(password);
  try {
    getAuthDatabase().prepare(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (@id, @email, @passwordHash, @createdAt, @updatedAt)
    `).run({ id: user.id, email, passwordHash, createdAt: now, updatedAt: now });
  } catch (error) {
    if (String(error).includes("UNIQUE")) throw new Error("EMAIL_TAKEN");
    throw error;
  }
  return user;
}

export function findUserByEmail(email: string) {
  const row = getAuthDatabase().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
  return row ? userFromRow(row) : null;
}

export function findUserWithPasswordByEmail(email: string) {
  return getAuthDatabase().prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;
}

export function createSession(userId: string) {
  const now = new Date();
  const days = Number(process.env.AUTH_SESSION_DAYS);
  const sessionDays = Number.isFinite(days) && days > 0 ? days : 30;
  const expiresAt = new Date(now.getTime() + sessionDays * 24 * 60 * 60 * 1000).toISOString();
  const token = crypto.randomBytes(32).toString("base64url");
  const session: AuthSession = { id: crypto.randomUUID(), userId, expiresAt };
  getAuthDatabase().prepare(`
    INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at, last_seen_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(session.id, userId, hashSessionToken(token), expiresAt, now.toISOString(), now.toISOString());
  return { token, session };
}

export function deleteSession(token: string | undefined) {
  if (!token) return;
  getAuthDatabase().prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashSessionToken(token));
}

export function getSessionUser(token: string | undefined) {
  if (!token) return null;
  const now = new Date().toISOString();
  const row = getAuthDatabase().prepare(`
    SELECT sessions.*, users.email, users.created_at AS user_created_at
    FROM sessions
    JOIN users ON users.id = sessions.user_id
    WHERE sessions.token_hash = ?
  `).get(hashSessionToken(token)) as (SessionRow & { email: string; user_created_at: string }) | undefined;
  if (!row) return null;
  if (row.expires_at <= now) {
    getAuthDatabase().prepare("DELETE FROM sessions WHERE id = ?").run(row.id);
    return null;
  }
  getAuthDatabase().prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(now, row.id);
  return {
    session: { id: row.id, userId: row.user_id, expiresAt: row.expires_at },
    user: { id: row.user_id, email: row.email, createdAt: row.user_created_at }
  };
}

export function hashSessionToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function saveSnapshotForUser(userId: string, snapshot: CloudSaveSnapshot) {
  const parsed = saveSnapshotSchema.parse(snapshot);
  const updatedAt = new Date().toISOString();
  getAuthDatabase().prepare(`
    INSERT INTO player_saves (user_id, save_json, updated_at, version)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
      save_json = excluded.save_json,
      updated_at = excluded.updated_at,
      version = excluded.version
  `).run(userId, JSON.stringify({ ...parsed, updatedAt }), updatedAt, parsed.version);
  return { ...parsed, updatedAt };
}

export function loadSnapshotForUser(userId: string) {
  const row = getAuthDatabase().prepare("SELECT * FROM player_saves WHERE user_id = ?").get(userId) as SaveRow | undefined;
  if (!row) return null;
  return saveSnapshotSchema.parse(JSON.parse(row.save_json));
}

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const db = getAuthDatabase();
  const current = db.prepare("SELECT count, reset_at FROM rate_limits WHERE key = ?").get(key) as { count: number; reset_at: number } | undefined;
  if (!current || current.reset_at <= now) {
    db.prepare("INSERT OR REPLACE INTO rate_limits (key, count, reset_at) VALUES (?, ?, ?)").run(key, 1, now + windowMs);
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt: now + windowMs };
  }
  if (current.count >= limit) return { allowed: false, remaining: 0, resetAt: current.reset_at };
  const next = current.count + 1;
  db.prepare("UPDATE rate_limits SET count = ? WHERE key = ?").run(next, key);
  return { allowed: true, remaining: Math.max(0, limit - next), resetAt: current.reset_at };
}

export function cookieIsSecure() {
  if (process.env.AUTH_COOKIE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_SECURE === "false") return false;
  return process.env.NODE_ENV === "production";
}

function userFromRow(row: UserRow): AuthUser {
  return { id: row.id, email: row.email, createdAt: row.created_at };
}
