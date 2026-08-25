import { auth } from "@/auth";
import {
  createAssignment,
  getAssignments,
  setAssignmentStatus,
} from "@/lib/sheets";
import { REVIEWERS } from "@/config/reviewers";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();
  const uscId = body.uscId as string;

  if (!uscId) {
    return Response.json(
      { error: "uscId required" },
      { status: 400 }
    );
  }

  const reviewerEmail = session.user.email;
  const assignments = await getAssignments();

  const myAssignment = assignments.find(
    (assignment) =>
      assignment.uscId === uscId &&
      assignment.reviewerEmail === reviewerEmail
  );

  if (!myAssignment) {
    return Response.json(
      { error: "You are not assigned to this application." },
      { status: 403 }
    );
  }

  if (myAssignment.status !== "assigned") {
    return Response.json(
      { error: "This assignment can no longer be recused." },
      { status: 409 }
    );
  }

  // Anyone who has ever been assigned to this application is excluded.
  // This includes the other reviewer and anyone who previously recused.
  const unavailableReviewers = new Set(
    assignments
      .filter((assignment) => assignment.uscId === uscId)
      .map((assignment) => assignment.reviewerEmail)
  );

  // Find the eligible reviewer with the fewest unread applications.
  const eligibleReviewers = REVIEWERS.filter(
    (reviewer) => !unavailableReviewers.has(reviewer.email)
  );

  if (eligibleReviewers.length === 0) {
    return Response.json(
      {
        error:
          "No eligible reviewer is available to replace you.",
      },
      { status: 409 }
    );
  }

  const replacementReviewer = eligibleReviewers.reduce(
    (bestReviewer, reviewer) => {
      const reviewerUnreadCount = assignments.filter(
        (assignment) =>
          assignment.reviewerEmail === reviewer.email &&
          assignment.status === "assigned"
      ).length;

      const bestUnreadCount = assignments.filter(
        (assignment) =>
          assignment.reviewerEmail === bestReviewer.email &&
          assignment.status === "assigned"
      ).length;

      // REVIEWERS order acts as the tie-breaker because we only
      // replace the current best when the count is strictly lower.
      return reviewerUnreadCount < bestUnreadCount
        ? reviewer
        : bestReviewer;
    }
  );

  // Mark the current reviewer as recused.
  await setAssignmentStatus(
    uscId,
    reviewerEmail,
    "recused"
  );

  // Assign the replacement reviewer.
  await createAssignment(
    uscId,
    replacementReviewer.email
  );

  return Response.json({
    ok: true,
    replacementReviewer: {
      name: replacementReviewer.name,
      email: replacementReviewer.email,
    },
  });
}