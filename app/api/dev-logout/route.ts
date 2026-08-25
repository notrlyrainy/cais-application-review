import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  res.cookies.set("dev-identity", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return res;
}
