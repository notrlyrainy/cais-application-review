import { auth } from "@/auth";
import { setAssignmentStatus } from "@/lib/sheets";

// Self-service only — a reviewer recuses themselves, never someone else.
// reviewerEmail always comes from the session, never the request body.
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const uscId = body.uscId as string;
  if (!uscId) {
    return Response.json({ error: "uscId required" }, { status: 400 });
  }

  await setAssignmentStatus(uscId, session.user.email, "recused");
  return Response.json({ ok: true });
}
