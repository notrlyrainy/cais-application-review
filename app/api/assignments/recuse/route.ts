import { auth } from "@/auth";
import {
  createAssignment,
  getAssignments,
  setAssignmentStatus,
} from "@/lib/sheets";
import { REVIEWERS } from "@/config/reviewers";

export async function POST(
  request: Request
) {
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

  const reviewerEmail =
    session.user.email;

  const assignments =
    await getAssignments();

  const myAssignment =
    assignments.find(
      (assignment) =>
        assignment.uscId === uscId &&
        assignment.reviewerEmail ===
          reviewerEmail &&
        assignment.status === "assigned"
    );

  if (!myAssignment) {
    return Response.json(
      {
        error:
          "You do not have an active assignment for this application.",
      },
      { status: 403 }
    );
  }

  // A reviewer who recused themselves can never be assigned
  // this application again. Completed reviewers are also
  // excluded because the application already has their review.
  const unavailableReviewers =
    new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.uscId === uscId &&
            (assignment.status ===
              "recused" ||
              assignment.status ===
                "completed" ||
              assignment.status ===
                "assigned")
        )
        .map(
          (assignment) =>
            assignment.reviewerEmail
        )
    );

  const eligibleReviewers =
    REVIEWERS.filter(
      (reviewer) =>
        !unavailableReviewers.has(
          reviewer.email
        )
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

  const replacementReviewer =
    eligibleReviewers.reduce(
      (bestReviewer, reviewer) => {
        const reviewerUnreadCount =
          assignments.filter(
            (assignment) =>
              assignment.reviewerEmail ===
                reviewer.email &&
              assignment.status ===
                "assigned"
          ).length;

        const bestUnreadCount =
          assignments.filter(
            (assignment) =>
              assignment.reviewerEmail ===
                bestReviewer.email &&
              assignment.status ===
                "assigned"
          ).length;

        return reviewerUnreadCount <
          bestUnreadCount
          ? reviewer
          : bestReviewer;
      }
    );

  await setAssignmentStatus(
    uscId,
    reviewerEmail,
    "recused"
  );

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