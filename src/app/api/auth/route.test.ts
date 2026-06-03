import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { closeAuthDatabaseForTests } from "@/lib/auth";
import { createEmptySnapshot } from "@/lib/cloud-save";
import { POST as register } from "./register/route";
import { POST as login } from "./login/route";
import { POST as logout } from "./logout/route";
import { GET as me } from "./me/route";
import { GET as loadSave, PUT as save } from "../save/route";

function request(pathname: string, init: RequestInit = {}) {
  return new Request(`http://localhost${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
      ...(init.headers ?? {})
    }
  });
}

const passwordKey = "password";

function credentials(email: string, secret: string) {
  return { email, [passwordKey]: secret };
}

describe("auth and save routes", () => {
  let tempDir = "";

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "emperor-routes-"));
    process.env.AUTH_DB_PATH = path.join(tempDir, "test.sqlite");
    process.env.AUTH_COOKIE_SECURE = "false";
  });

  afterEach(() => {
    closeAuthDatabaseForTests();
    delete process.env.AUTH_DB_PATH;
    delete process.env.AUTH_COOKIE_SECURE;
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

	  it("registers, reads current user, saves progress, and logs out", async () => {
	    const registered = await register(request("/api/auth/register", {
	      method: "POST",
	      body: JSON.stringify(credentials("player@example.com", "correct-password"))
	    }));
    expect(registered.status).toBe(200);
    const cookie = registered.headers.get("Set-Cookie") ?? "";
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");

    const current = await me(request("/api/auth/me", { headers: { Cookie: cookie } }));
    await expect(current.json()).resolves.toMatchObject({ user: { email: "player@example.com" }, save: null });

    const snapshot = { ...createEmptySnapshot(), currentRunId: "run-api" };
    const saved = await save(request("/api/save", { method: "PUT", headers: { Cookie: cookie }, body: JSON.stringify(snapshot) }));
    expect(saved.status).toBe(200);

    const loaded = await loadSave(request("/api/save", { headers: { Cookie: cookie } }));
    await expect(loaded.json()).resolves.toMatchObject({ save: { currentRunId: "run-api" } });

    const loggedOut = await logout(request("/api/auth/logout", { method: "POST", headers: { Cookie: cookie } }));
    expect(loggedOut.headers.get("Set-Cookie")).toContain("Expires=Thu, 01 Jan 1970");
  });

	  it("logs in with valid credentials and rejects bad credentials", async () => {
	    await register(request("/api/auth/register", {
	      method: "POST",
	      body: JSON.stringify(credentials("player@example.com", "correct-password"))
	    }));

	    const failed = await login(request("/api/auth/login", {
	      method: "POST",
	      body: JSON.stringify(credentials("player@example.com", "wrong-password"))
	    }));
    expect(failed.status).toBe(401);

	    const loggedIn = await login(request("/api/auth/login", {
	      method: "POST",
	      body: JSON.stringify(credentials("player@example.com", "correct-password"))
	    }));
    expect(loggedIn.status).toBe(200);
    expect(loggedIn.headers.get("Set-Cookie")).toContain("emperor_feed_session=");
  });

  it("rejects cross-origin writes and unauthenticated saves", async () => {
	    const crossOrigin = await register(request("/api/auth/register", {
	      method: "POST",
	      headers: { Origin: "http://evil.test" },
	      body: JSON.stringify(credentials("player@example.com", "correct-password"))
	    }));
    expect(crossOrigin.status).toBe(403);

    const unauthenticated = await save(request("/api/save", {
      method: "PUT",
      body: JSON.stringify(createEmptySnapshot())
    }));
    expect(unauthenticated.status).toBe(401);
  });
});
