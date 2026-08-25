import { auth } from "@/auth";
import {
  createAssignments,
  getApplications,
  getAssignments,
} from "@/lib/sheets";
import { REVIEWERS } from "@/config/reviewers";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const applications = await getApplications();
  const existingAssignments = await getAssignments();

  // Generate every unique pair of reviewers.
  const reviewerPairs: [
    (typeof REVIEWERS)[number],
    (typeof REVIEWERS)[number]
  ][] = [];

  for (let i = 0; i < REVIEWERS.length; i++) {
    for (let j = i + 1; j < REVIEWERS.length; j++) {
      reviewerPairs.push([REVIEWERS[i], REVIEWERS[j]]);
    }
  }

  const assignmentsToCreate: {
    uscId: string;
    reviewerEmail: string;
  }[] = [];

  for (let index = 0; index < applications.length; index++) {
    const application = applications[index];

    const assignedReviewers = existingAssignments
      .filter(
        (assignment) => assignment.uscId === application.uscId
      )
      .map((assignment) => assignment.reviewerEmail);

    // Skip applications that already have two reviewers.
    if (assignedReviewers.length >= 2) {
      continue;
    }

    // Each application's reviewer pair is based on its position
    // in the full application list.
    const [reviewer1, reviewer2] =
      reviewerPairs[index % reviewerPairs.length];

    const intendedReviewers = [
      reviewer1.email,
      reviewer2.email,
    ];

    // Only add reviewers who aren't already assigned.
    for (const reviewerEmail of intendedReviewers) {
      if (!assignedReviewers.includes(reviewerEmail)) {
        assignmentsToCreate.push({
          uscId: application.uscId,
          reviewerEmail,
        });
      }
    }
  }

  if (assignmentsToCreate.length === 0) {
    return Response.json({
      ok: true,
      message: "All applications are already assigned.",
      assignmentsCreated: 0,
    });
  }

  await createAssignments(assignmentsToCreate);

  return Response.json({
    ok: true,
    applicationsChecked: applications.length,
    assignmentsCreated: assignmentsToCreate.length,
  });
}