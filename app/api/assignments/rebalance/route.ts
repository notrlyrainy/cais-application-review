import { auth } from "@/auth";
import {
  createAssignments,
  getAssignments,
  setAssignmentStatus,
} from "@/lib/sheets";
import { REVIEWERS } from "@/config/reviewers";

const ADMIN_EMAIL = "anniegao@usc.edu";

export async function POST() {
  const session = await auth();

  if (!session?.user?.email) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return Response.json(
      {
        error:
          "Only Annie can rebalance reviewer assignments.",
      },
      { status: 403 }
    );
  }

  const assignments = await getAssignments();

  const unreadAssignments = assignments.filter(
    (assignment) => assignment.status === "assigned"
  );

  if (unreadAssignments.length === 0) {
    return Response.json({
      ok: true,
      assignmentsMoved: 0,
    });
  }

  // Start by counting unread assignments per reviewer.
  const unreadCounts = new Map<string, number>();

  for (const reviewer of REVIEWERS) {
    unreadCounts.set(reviewer.email, 0);
  }

  // Group active unread assignments by application.
  const unreadByApplication = new Map<
    string,
    typeof unreadAssignments
  >();

  for (const assignment of unreadAssignments) {
    const existing =
      unreadByApplication.get(assignment.uscId) ?? [];

    existing.push(assignment);

    unreadByApplication.set(
      assignment.uscId,
      existing
    );
  }

  const newAssignments: {
    uscId: string;
    reviewerEmail: string;
  }[] = [];

  const assignmentsToReassign: {
    uscId: string;
    reviewerEmail: string;
  }[] = [];

  for (const [
    uscId,
    activeAssignments,
  ] of unreadByApplication) {
    // Reviewers who are permanently unavailable for this
    // application because they recused themselves.
    const recusedReviewers = new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.uscId === uscId &&
            assignment.status === "recused"
        )
        .map(
          (assignment) =>
            assignment.reviewerEmail
        )
    );

    // Completed reviewers stay fixed.
    const completedReviewers = new Set(
      assignments
        .filter(
          (assignment) =>
            assignment.uscId === uscId &&
            assignment.status === "completed"
        )
        .map(
          (assignment) =>
            assignment.reviewerEmail
        )
    );

    // Reviewers selected for unread slots on this application.
    const selectedReviewers = new Set<string>();

    for (const currentAssignment of activeAssignments) {
      const unavailableReviewers = new Set([
        ...recusedReviewers,
        ...completedReviewers,
        ...selectedReviewers,
      ]);

      const eligibleReviewers = REVIEWERS.filter(
        (reviewer) =>
          !unavailableReviewers.has(
            reviewer.email
          )
      );

      if (eligibleReviewers.length === 0) {
        continue;
      }

      const replacementReviewer =
        eligibleReviewers.reduce(
          (bestReviewer, reviewer) => {
            const reviewerCount =
              unreadCounts.get(
                reviewer.email
              ) ?? 0;

            const bestCount =
              unreadCounts.get(
                bestReviewer.email
              ) ?? 0;

            return reviewerCount < bestCount
              ? reviewer
              : bestReviewer;
          }
        );

      selectedReviewers.add(
        replacementReviewer.email
      );

      unreadCounts.set(
        replacementReviewer.email,
        (unreadCounts.get(
          replacementReviewer.email
        ) ?? 0) + 1
      );

      // If this reviewer already owns this unread application,
      // leave the assignment untouched instead of creating a
      // duplicate history row.
      if (
        replacementReviewer.email ===
        currentAssignment.reviewerEmail
      ) {
        continue;
      }

      assignmentsToReassign.push({
        uscId,
        reviewerEmail:
          currentAssignment.reviewerEmail,
      });

      newAssignments.push({
        uscId,
        reviewerEmail:
          replacementReviewer.email,
      });
    }
  }

  // Mark old unread assignments as reassigned.
  for (const assignment of assignmentsToReassign) {
    await setAssignmentStatus(
      assignment.uscId,
      assignment.reviewerEmail,
      "reassigned"
    );
  }

  // Create the new active assignments.
  await createAssignments(newAssignments);

  return Response.json({
    ok: true,
    assignmentsMoved: newAssignments.length,
  });
}