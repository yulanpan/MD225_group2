import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  authCredentialsSchema,
  checkRateLimit,
  closeAuthDatabaseForTests,
  createSession,
  createUser,
  deleteSession,
  getSessionUser,
  hashPassword,
  loadSnapshotForUser,
  saveSnapshotForUser,
  verifyPassword
} from "./auth";
import { createEmptyProfile } from "./profile";
import { initialState } from "./game-data";

const passwordKey = "password";

describe("auth and cloud save helpers", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "emperor-auth-"));
    process.env.AUTH_DB_PATH = path.join(tempDir, "test.sqlite");
  });

  afterEach(() => {
    closeAuthDatabaseForTests();
    delete process.env.AUTH_DB_PATH;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

	it("normalizes credentials and enforces password length", () => {
		const parsed = authCredentialsSchema.parse({ email: " Player@Example.COM ", [passwordKey]: "long-password" });
		expect(parsed.email).toBe("player@example.com");
		expect(parsed[passwordKey]).toBe("long-password");
		expect(() => authCredentialsSchema.parse({ email: "bad", [passwordKey]: "short" })).toThrow();
	});

  it("hashes and verifies passwords without storing plaintext", async () => {
    const encoded = await hashPassword("correct-password");
    expect(encoded).toMatch(/^scrypt:v1:/);
    expect(encoded).not.toContain("correct-password");
    await expect(verifyPassword("correct-password", encoded)).resolves.toBe(true);
    await expect(verifyPassword("wrong-password", encoded)).resolves.toBe(false);
  });

  it("creates users and rejects duplicate email", async () => {
    const user = await createUser("player@example.com", "correct-password");
    expect(user.email).toBe("player@example.com");
    await expect(createUser("player@example.com", "another-password")).rejects.toThrow("EMAIL_TAKEN");
  });

  it("creates, resolves, and deletes sessions", async () => {
    const user = await createUser("player@example.com", "correct-password");
    const { token, session } = createSession(user.id);
    expect(token).toHaveLength(43);
    expect(getSessionUser(token)).toMatchObject({ user: { email: "player@example.com" }, session: { id: session.id } });
    deleteSession(token);
    expect(getSessionUser(token)).toBeNull();
  });

  it("stores and loads a complete save snapshot", async () => {
    const user = await createUser("player@example.com", "correct-password");
    const saved = saveSnapshotForUser(user.id, {
      version: 1,
      profile: createEmptyProfile(),
      state: initialState,
      ending: null,
      finalState: null,
      currentRunId: "run-test",
      briefingDismissed: true,
      guidanceUnlocked: true,
      updatedAt: new Date(0).toISOString()
    });
    expect(saved.updatedAt).not.toBe(new Date(0).toISOString());
    expect(loadSnapshotForUser(user.id)).toMatchObject({
      currentRunId: "run-test",
      briefingDismissed: true,
      guidanceUnlocked: true
    });
  });

  it("enforces rate limits by key and window", () => {
    expect(checkRateLimit("login:test", 2, 1000, 100).allowed).toBe(true);
    expect(checkRateLimit("login:test", 2, 1000, 200).allowed).toBe(true);
    expect(checkRateLimit("login:test", 2, 1000, 300).allowed).toBe(false);
    expect(checkRateLimit("login:test", 2, 1000, 1200).allowed).toBe(true);
  });
});
