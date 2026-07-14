import { NextResponse } from "next/server";
import { REVIEWERS } from "@/config/reviewers";

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!REVIEWERS.some((r) => r.email === email)) {
    return NextResponse.json({ error: "Unknown reviewer" }, { status: 400 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("dev-identity", email, { httpOnly: true, path: "/" });
  return res;
}
