import { auth } from "@/auth";
import {
  getAssignments,
  submitReview,
  setAssignmentStatus,
} from "@/lib/sheets";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const assignments = await getAssignments();

  const myAssignment = assignments.find(
    (assignment) =>
      assignment.uscId === body.uscId &&
      assignment.reviewerEmail === session.user.email &&
      assignment.status === "assigned"
  );

  if (!myAssignment) {
    return Response.json(
      {
        error:
          "You are not assigned to review this application.",
      },
      { status: 403 }
    );
  }

  await submitReview({
    uscId: body.uscId,
    reviewerEmail: session.user.email,
    experienceScore: body.experienceScore,
    researchScore: body.researchScore,
    qualityScore: body.qualityScore,
    notes: body.notes,
    submittedAt: new Date().toISOString(),
  });

  await setAssignmentStatus(
    body.uscId,
    session.user.email,
    "completed"
  );

  return Response.json({ ok: true });
}