"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { applySnapshot, collectLocalSnapshot, localSnapshotIsMeaningful, resolveSnapshotConflict } from "@/lib/cloud-save-client";
import type { CloudSaveSnapshot } from "@/lib/cloud-save";
import { commonText, languageName } from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";

type AuthMode = "login" | "register";
type AuthUser = { id: string; email: string; createdAt: string };
type AuthResponse = { user: AuthUser; save: CloudSaveSnapshot | null; error?: string };

export default function LoginPage() {
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "conflict">("idle");
  const [error, setError] = useState("");
  const [pending, setPending] = useState<{ local: CloudSaveSnapshot; remote: CloudSaveSnapshot } | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((response) => response.json())
      .then((data: { user: AuthUser | null }) => {
        if (data.user) router.replace("/dashboard");
      })
      .catch(() => null);
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setStatus("submitting");
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    }).catch(() => null);
    if (!response) {
      setError(language === "zh" ? "网络请求失败。" : "Network request failed.");
      setStatus("idle");
      return;
    }
    const data = (await response.json()) as AuthResponse;
    if (!response.ok) {
      setError(data.error ?? (language === "zh" ? "登录失败。" : "Authentication failed."));
      setStatus("idle");
      return;
    }
    const local = collectLocalSnapshot();
    if (data.save && localSnapshotIsMeaningful(local)) {
      setPending({ local, remote: data.save });
      setStatus("conflict");
      return;
    }
    if (data.save) applySnapshot(data.save);
    else if (localSnapshotIsMeaningful(local)) await uploadSnapshot(local);
    router.replace("/dashboard");
  }

  async function resolve(choice: "local" | "remote" | "merge") {
    if (!pending) return;
    const snapshot = resolveSnapshotConflict(choice, pending.local, pending.remote);
    applySnapshot(snapshot);
    await uploadSnapshot(snapshot);
    router.replace("/dashboard");
  }

  return (
    <main className="page auth-page ui-shift">
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-light" aria-hidden="true" />
      <header className="topbar" aria-label="Navigation">
        <Link className="brand-mark" href="/">{language === "zh" ? "PNE / 宫廷信息流" : "PNE / Royal Feed"}</Link>
        <nav className="topbar-links">
          <Link href="/">{commonText("start", language)}</Link>
          <Link href="/dashboard">{commonText("operations", language)}</Link>
          <Link href="/archive">{commonText("archive", language)}</Link>
        </nav>
        <div className="topbar-actions">
          <button className="language-toggle" onClick={toggleLanguage} aria-label={commonText("switchLanguage", language)}>
            <span className={language === "en" ? "active" : ""}>{languageName("en")}</span>
            <span className={language === "zh" ? "active" : ""}>{languageName("zh")}</span>
          </button>
        </div>
      </header>

      <section className="section auth-section">
        <div className="auth-shell">
          <div className="auth-copy">
            <p className="eyebrow">{language === "zh" ? "账号进度" : "Account Save"}</p>
            <h1>{language === "zh" ? "保存进度" : "Save your progress"}</h1>
            <p>{language === "zh" ? "不登录也能玩。登录后，可以保留当前进度、结局和成就，之后回来继续。" : "Guest play stays available. Sign in to keep your progress, endings, and achievements for later."}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            <div className="auth-tabs" role="tablist">
              <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>{language === "zh" ? "登录" : "Login"}</button>
              <button type="button" className={mode === "register" ? "active" : ""} onClick={() => setMode("register")}>{language === "zh" ? "注册" : "Register"}</button>
            </div>
            <label>
              <span>{language === "zh" ? "邮箱" : "Email"}</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
            </label>
            <label>
              <span>{language === "zh" ? "密码" : "Password"}</span>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={10} maxLength={128} required />
            </label>
            <p className="auth-hint">{language === "zh" ? "密码至少 10 个字符。" : "Passwords need at least 10 characters."}</p>
            {error && <p className="auth-error">{error}</p>}
            <button className="btn primary" disabled={status === "submitting"}>{status === "submitting" ? (language === "zh" ? "处理中" : "Working") : mode === "login" ? (language === "zh" ? "登录" : "Login") : (language === "zh" ? "注册并登录" : "Register and login")}</button>
          </form>
        </div>
      </section>

      {status === "conflict" && (
        <div className="command-overlay modal-overlay active">
          <div className="modal-panel auth-conflict" role="dialog" aria-modal="true" aria-labelledby="save-conflict-title">
            <div className="modal-head">
              <p className="eyebrow">{language === "zh" ? "存档冲突" : "Save Conflict"}</p>
              <h3 id="save-conflict-title">{language === "zh" ? "选择要保留的进度" : "Choose progress to keep"}</h3>
            </div>
            <p>{language === "zh" ? "这台电脑和账号里都有进度。你想用哪一份？" : "This browser and account both have progress. Choose which progress to keep."}</p>
            <div className="auth-conflict-actions">
              <button className="btn secondary" onClick={() => void resolve("remote")}>{language === "zh" ? "用账号进度" : "Use Account"}</button>
              <button className="btn secondary" onClick={() => void resolve("local")}>{language === "zh" ? "用这台电脑" : "Use This Browser"}</button>
              <button className="btn primary" onClick={() => void resolve("merge")}>{language === "zh" ? "合并已完成记录" : "Merge Completed Records"}</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

async function uploadSnapshot(snapshot: CloudSaveSnapshot) {
  await fetch("/api/save", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot)
  }).catch(() => null);
}
