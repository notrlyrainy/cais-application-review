import {auth} from "@/auth";
import {submitReview, setAssignmentStatus} from "@/lib/sheets";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({error: "Unauthorized"}, {status: 401});
  }

  const body = await request.json();

  await submitReview({
    uscId: body.uscId,
    reviewerEmail: session.user.email,
    experienceScore: body.experienceScore,
    researchScore: body.researchScore,
    qualityScore: body.qualityScore,
    notes: body.notes,
    submittedAt: new Date().toISOString(),
  });

  await setAssignmentStatus(body.uscId, session.user.email, "completed");

  return Response.json({ ok: true });
}