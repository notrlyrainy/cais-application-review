import { getApplications, getAssignments, getReviews } from "@/lib/sheets";



console.log("KEY starts:", process.env.GOOGLE_PRIVATE_KEY?.slice(0, 30));
console.log("KEY length:", process.env.GOOGLE_PRIVATE_KEY?.length);
console.log("first char code:", process.env.GOOGLE_PRIVATE_KEY?.charCodeAt(0));
export async function GET() {
  const applications = await getApplications();
  const assignments = await getAssignments();
  const reviews = await getReviews();
  return Response.json({ applications, assignments, reviews });
}