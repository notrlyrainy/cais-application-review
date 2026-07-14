"use client";
import { useRouter } from "next/navigation";
import { REVIEWERS } from "@/config/reviewers";

export default function LoginPage() {
  const router = useRouter();

  async function loginAs(email: string) {
    await fetch("/api/dev-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-10 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-2">CAIS++ Review Portal</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
          [DEV MODE] Pick a fake identity — real Google sign-in comes later
        </p>
        <div className="space-y-2">
          {REVIEWERS.map((r) => (
            <button
              key={r.email}
              onClick={() => loginAs(r.email)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-3 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Sign in as {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}