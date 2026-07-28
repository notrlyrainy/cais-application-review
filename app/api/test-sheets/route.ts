
import { getApplications, getAssignments, getReviews } from "@/lib/sheets";


export async function GET() {
  const applications = await getApplications();
  const assignments = await getAssignments();
  const reviews = await getReviews();
  return Response.json({ applications, assignments, reviews });
}

/*

import { submitReview, createAssignment } from "@/lib/sheets";

export async function GET() {
  await createAssignment("123123", "reviewer1@usc.edu");

  await submitReview({
    uscId: "123123",
    reviewerEmail: "reviewer1@usc.edu",
    experienceScore: 2,
    researchScore: 3,
    qualityScore: 1,
    notes: "test write",
    submittedAt: new Date().toISOString(),
  });

  return Response.json({ ok: true });
}
  */