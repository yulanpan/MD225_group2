"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { applySnapshot, collectLocalSnapshot, localSnapshotIsMeaningful } from "@/lib/cloud-save-client";
import type { CloudSaveSnapshot } from "@/lib/cloud-save";
import type { LanguageCode } from "@/lib/i18n";

type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
};

type AuthResponse = {
  user: AuthUser | null;
  save: CloudSaveSnapshot | null;
};

export default function AuthControl({ language, compact = false }: { language: LanguageCode; compact?: boolean }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "guest" | "saved" | "saving" | "error">("loading");
  const lastSavedRef = useRef("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/auth/me")
      .then((response) => response.json() as Promise<AuthResponse>)
      .then((data) => {
        if (cancelled) return;
        setUser(data.user);
        if (!data.user) {
          setStatus("guest");
          return;
        }
        const local = collectLocalSnapshot();
        if (!localSnapshotIsMeaningful(local) && data.save) {
          applySnapshot(data.save);
          lastSavedRef.current = snapshotSignature(data.save);
        }
        setStatus("saved");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const sync = () => {
      const snapshot = collectLocalSnapshot();
      if (!localSnapshotIsMeaningful(snapshot)) return;
      const serialized = JSON.stringify(snapshot);
      const signature = snapshotSignature(snapshot);
      if (signature === lastSavedRef.current) return;
      setStatus("saving");
      void fetch("/api/save", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: serialized
      })
        .then((response) => {
          if (!response.ok) throw new Error("save failed");
          lastSavedRef.current = signature;
          setStatus("saved");
        })
        .catch(() => setStatus("error"));
    };
    sync();
    const timer = window.setInterval(sync, 5000);
    return () => window.clearInterval(timer);
  }, [user]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setUser(null);
    setStatus("guest");
  }

  if (!user) {
    return (
      <Link className={compact ? "auth-link compact" : "auth-link"} href="/login">
        {language === "zh" ? "登录 / 注册" : "Login / Register"}
      </Link>
    );
  }

  return (
    <div className={compact ? "auth-chip compact" : "auth-chip"}>
      <span title={user.email}>{user.email}</span>
      <small>{statusLabel(status, language)}</small>
      <button type="button" onClick={logout}>{language === "zh" ? "退出" : "Logout"}</button>
    </div>
  );
}

function snapshotSignature(snapshot: CloudSaveSnapshot) {
  return JSON.stringify({ ...snapshot, updatedAt: "" });
}

function statusLabel(status: "loading" | "guest" | "saved" | "saving" | "error", language: LanguageCode) {
  if (language === "zh") {
    if (status === "saving") return "保存中";
    if (status === "saved") return "已云存档";
    if (status === "error") return "保存失败";
    if (status === "loading") return "检查账号";
    return "游客";
  }
  if (status === "saving") return "Saving";
  if (status === "saved") return "Cloud saved";
  if (status === "error") return "Save failed";
  if (status === "loading") return "Checking";
  return "Guest";
}
