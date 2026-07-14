import { cookies } from "next/headers";
import { REVIEWERS } from "@/config/reviewers";

export type Session = {
    user: {name: string; email: string};
};

export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const email = cookieStore.get("dev-identity")?.value;
  if (!email) return null;

  const reviewer = REVIEWERS.find((r) => r.email === email);
  return reviewer ? { user: reviewer } : null;
}