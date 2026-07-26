import { auth } from "@/auth";
import { getApplications, getAssignments, getReviews } from "@/lib/sheets";
import { visibleReviews } from "@/lib/scoring";

export async function GET() {
    const session = await auth();
    if(!session?.user) {
        return Response.json({error: "Unauthorized"}, {status: 401});
    }

    const [applications, assignments, reviews] = await Promise.all([
        getApplications(),
        getAssignments(),
        getReviews(),
    ]);

    const items = applications.map((app) => {
        const forThisApp = reviews.filter((r) => r.uscId === app.uscId);
        return {
            application: app,
            assignments: assignments.filter((a) => a.uscId === app.uscId),
            reviews: visibleReviews(forThisApp, session.user.email),
        }
    })

    return Response.json({items});
}