import {
  authCredentialsSchema,
  checkRateLimit,
  cookieIsSecure,
  createSession,
  createUser,
  deleteSession,
  findUserWithPasswordByEmail,
  getSessionUser,
  loadSnapshotForUser,
  saveSnapshotForUser,
  saveSnapshotSchema,
  sessionCookieName,
  verifyPassword,
  type AuthUser
} from "./auth";

const loginWindowMs = 10 * 60 * 1000;
const registerWindowMs = 60 * 60 * 1000;

export function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return Response.json(body, init);
}

export function forbiddenOriginResponse() {
  return jsonResponse({ error: "Invalid request origin." }, { status: 403 });
}

export function sameOriginRequest(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === new URL(request.url).origin;
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local";
}

export function sessionTokenFromRequest(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const prefix = `${sessionCookieName}=`;
  return cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

export function currentAuth(request: Request) {
  return getSessionUser(sessionTokenFromRequest(request));
}

export function requireAuth(request: Request) {
  const auth = currentAuth(request);
  if (!auth) return null;
  return auth;
}

export function authUserPayload(user: AuthUser) {
  return { id: user.id, email: user.email, createdAt: user.createdAt };
}

export async function registerFromRequest(request: Request) {
  if (!sameOriginRequest(request)) return forbiddenOriginResponse();
  const parsed = authCredentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonResponse({ error: "Invalid email or password." }, { status: 400 });
  const limit = checkRateLimit(`register:${clientIp(request)}`, 10, registerWindowMs);
  if (!limit.allowed) return jsonResponse({ error: "Too many registration attempts." }, { status: 429 });

  try {
    const user = await createUser(parsed.data.email, parsed.data.password);
    const { token, session } = createSession(user.id);
    return jsonResponse({ user: authUserPayload(user), save: loadSnapshotForUser(user.id) }, {
      headers: { "Set-Cookie": sessionCookieHeader(token, session.expiresAt, request) }
    });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_TAKEN") {
      return jsonResponse({ error: "Email is already registered." }, { status: 409 });
    }
    throw error;
  }
}

export async function loginFromRequest(request: Request) {
  if (!sameOriginRequest(request)) return forbiddenOriginResponse();
  const parsed = authCredentialsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonResponse({ error: "Invalid email or password." }, { status: 400 });
  const limit = checkRateLimit(`login:${clientIp(request)}:${parsed.data.email}`, 5, loginWindowMs);
  if (!limit.allowed) return jsonResponse({ error: "Too many login attempts." }, { status: 429 });

  const row = findUserWithPasswordByEmail(parsed.data.email);
  const valid = row ? await verifyPassword(parsed.data.password, row.password_hash) : false;
  if (!row || !valid) return jsonResponse({ error: "Invalid email or password." }, { status: 401 });

  const user = { id: row.id, email: row.email, createdAt: row.created_at };
  const { token, session } = createSession(user.id);
  return jsonResponse({ user: authUserPayload(user), save: loadSnapshotForUser(user.id) }, {
    headers: { "Set-Cookie": sessionCookieHeader(token, session.expiresAt, request) }
  });
}

export function logoutFromRequest(request: Request) {
  if (!sameOriginRequest(request)) return forbiddenOriginResponse();
  deleteSession(sessionTokenFromRequest(request));
  return jsonResponse({ ok: true }, { headers: { "Set-Cookie": clearSessionCookieHeader(request) } });
}

export function meFromRequest(request: Request) {
  const auth = currentAuth(request);
  if (!auth) return jsonResponse({ user: null, save: null });
  return jsonResponse({ user: authUserPayload(auth.user), save: loadSnapshotForUser(auth.user.id) });
}

export async function saveFromRequest(request: Request) {
  if (!sameOriginRequest(request)) return forbiddenOriginResponse();
  const auth = requireAuth(request);
  if (!auth) return jsonResponse({ error: "Authentication required." }, { status: 401 });
  const parsed = saveSnapshotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonResponse({ error: "Invalid save snapshot." }, { status: 400 });
  return jsonResponse({ save: saveSnapshotForUser(auth.user.id, parsed.data) });
}

export function loadSaveFromRequest(request: Request) {
  const auth = requireAuth(request);
  if (!auth) return jsonResponse({ error: "Authentication required." }, { status: 401 });
  return jsonResponse({ save: loadSnapshotForUser(auth.user.id) });
}

export function sessionCookieHeader(token: string, expiresAt: string, request: Request) {
  return cookieHeader(sessionCookieName, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: secureCookieForRequest(request),
    path: "/",
    expires: new Date(expiresAt)
  });
}

export function clearSessionCookieHeader(request: Request) {
  return cookieHeader(sessionCookieName, "", {
    httpOnly: true,
    sameSite: "Lax",
    secure: secureCookieForRequest(request),
    path: "/",
    expires: new Date(0)
  });
}

function secureCookieForRequest(request: Request) {
  if (process.env.AUTH_COOKIE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_SECURE === "false") return false;
  return new URL(request.url).protocol === "https:" && cookieIsSecure();
}

function cookieHeader(
  name: string,
  value: string,
  options: { httpOnly: boolean; sameSite: "Lax" | "Strict"; secure: boolean; path: string; expires: Date }
) {
  return [
    `${name}=${value}`,
    `Expires=${options.expires.toUTCString()}`,
    `Path=${options.path}`,
    `SameSite=${options.sameSite}`,
    options.httpOnly ? "HttpOnly" : "",
    options.secure ? "Secure" : ""
  ].filter(Boolean).join("; ");
}
