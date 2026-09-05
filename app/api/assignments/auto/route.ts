import { auth } from "@/auth";
import { REVIEWERS } from "@/config/reviewers";
import { createAssignments, getApplications, getAssignments } from "@/lib/sheets";

export async function POST() {
  const session = await auth();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applications = await getApplications();
  const existingAssignments = await getAssignments();

  // A USC ID should correspond to exactly one application.
  // Deduplicate defensively in case someone submits the form more than once.
  const uniqueApplications = Array.from(
    new Map(applications.map((application) => [application.uscId, application])).values()
  );

  // Generate every possible reviewer pair.
  const reviewerPairs: [typeof REVIEWERS[number], typeof REVIEWERS[number]][] = [];

  for (let i = 0; i < REVIEWERS.length; i++) {
    for (let j = i + 1; j < REVIEWERS.length; j++) {
      reviewerPairs.push([REVIEWERS[i], REVIEWERS[j]]);
    }
  }

  const assignmentsToCreate: {
    uscId: string;
    reviewerEmail: string;
  }[] = [];

  for (let index = 0; index < uniqueApplications.length; index++) {
    const application = uniqueApplications[index];

    const assignedReviewers = existingAssignments
      .filter((assignment) => assignment.uscId === application.uscId)
      .map((assignment) => assignment.reviewerEmail);

    // Already has two reviewers.
    if (assignedReviewers.length >= 2) {
      continue;
    }

    const [reviewer1, reviewer2] =
      reviewerPairs[index % reviewerPairs.length];

    const intendedReviewers = [reviewer1.email, reviewer2.email];

    for (const reviewerEmail of intendedReviewers) {
      if (!assignedReviewers.includes(reviewerEmail)) {
        assignmentsToCreate.push({
          uscId: application.uscId,
          reviewerEmail,
        });
      }
    }
  }

  if (assignmentsToCreate.length > 0) {
    await createAssignments(assignmentsToCreate);
  }

  return Response.json({
    created: assignmentsToCreate.length,
  });
}