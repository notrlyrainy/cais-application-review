import { auth } from "@/auth";
import {
  getApplications,
  getAssignments,
  getReviews,
} from "@/lib/sheets";
import { visibleReviews } from "@/lib/scoring";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ uscId: string }> }
) {
  const session = await auth();

  if (!session?.user) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { uscId } = await params;

  const [applications, assignments, reviews] =
    await Promise.all([
      getApplications(),
      getAssignments(),
      getReviews(),
    ]);

  const application = applications.find(
    (a) => a.uscId === uscId
  );

  if (!application) {
    return Response.json(
      { error: "Not found" },
      { status: 404 }
    );
  }

  const forThisApp = reviews.filter(
    (r) => r.uscId === uscId
  );

  return Response.json({
    application,
    assignments: assignments.filter(
      (a) => a.uscId === uscId
    ),
    reviews: visibleReviews(
      forThisApp,
      session.user.email
    ),
  });
}