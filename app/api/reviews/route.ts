import { auth } from "@/auth";
import {
  getAssignments,
  submitReview,
  updateReview,
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

export async function PATCH(request: Request) {
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
      assignment.status === "completed"
  );

  if (!myAssignment) {
    return Response.json(
      {
        error:
          "You do not have a completed review for this application.",
      },
      { status: 403 }
    );
  }

  const updated = await updateReview({
    uscId: body.uscId,
    reviewerEmail: session.user.email,
    experienceScore: body.experienceScore,
    researchScore: body.researchScore,
    qualityScore: body.qualityScore,
    notes: body.notes,
    submittedAt: new Date().toISOString(),
  });

  if (!updated) {
    return Response.json(
      {
        error: "Could not find your existing review.",
      },
      { status: 404 }
    );
  }

  return Response.json({ ok: true });
}