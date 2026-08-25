import { auth } from "@/auth";
import { setDecision } from "@/lib/sheets";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  await setDecision(body.uscId, body.decision, body.notes ?? "");
  return Response.json({ ok: true });
}