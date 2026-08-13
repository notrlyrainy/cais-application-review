import { auth } from "@/auth";
import { getAssignments, createAssignment } from "@/lib/sheets";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const uscId = body.uscId as string;
  const reviewerEmail = (body.reviewerEmail as string) || session.user.email;

  if (!uscId) {
    return Response.json({ error: "uscId required" }, { status: 400 });
  }

  const assignments = await getAssignments();
  const alreadyAssigned = assignments.some(
    (a) => a.uscId === uscId && a.reviewerEmail === reviewerEmail
  );
  if (alreadyAssigned) {
    return Response.json({ error: "Already assigned" }, { status: 409 });
  }

  await createAssignment(uscId, reviewerEmail);
  return Response.json({ ok: true });
}
