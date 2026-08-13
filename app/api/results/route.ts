import {auth} from "@/auth";
import {getApplications, getReviews} from "@/lib/sheets";
import {averageScores} from "@/lib/scoring";

export async function GET() {
    const session = await auth();
    if(!session?.user) {
        return Response.json({error: "Unauthorized"}, {status: 401});
    }

    const [applications, reviews] = await Promise.all([
        getApplications(),
        getReviews(),
    ]);

    const results = applications.map((app) => {
        const currAppReviews = reviews.filter((r) => r.uscId === app.uscId);
        return {
            application: app,
            reviewCount: currAppReviews.length,
            averages: averageScores(currAppReviews),
        };
    });

    results.sort((a,b) => (b.averages?.overall ?? -1) - (a.averages?.overall ?? -1));
    return Response.json({results});
}