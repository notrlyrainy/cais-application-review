"use client";
import { useEffect, useState } from "react";

type SessionUser = { name: string; email: string } | null;

export function useSession() {
  const [user, setUser] = useState<SessionUser>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  useEffect(() => {
    fetch("/api/dev-session")
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setStatus(data.user ? "authenticated" : "unauthenticated");
      });
  }, []);

  return { data: user ? { user } : null, status };
}

export async function signOut({ callbackUrl }: { callbackUrl?: string } = {}) {
  await fetch("/api/dev-logout", { method: "POST" });
  if (callbackUrl) window.location.href = callbackUrl;
}