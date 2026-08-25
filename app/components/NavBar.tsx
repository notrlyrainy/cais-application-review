"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function NavBar() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/dev-logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <nav className="border-b p-4 flex items-center gap-4 text-sm">
      <Link href="/dashboard" className="hover:underline">
        Dashboard
      </Link>

      <Link href="/results" className="hover:underline">
        Results
      </Link>

      <button
        onClick={handleLogout}
        className="ml-auto hover:underline"
      >
        Logout
      </button>
    </nav>
  );
}