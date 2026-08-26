import { Review } from "./types";

export const CRITERIA = [
  {
    key: "experienceScore",
    label: "Experience",
    levels: {
      1: "No understanding of ML",
      2: "ML background",
      3: "AI research",
    },
  },
  {
    key: "researchScore",
    label: "Research",
    levels: {
      1: "No shown research interest",
      2: "Coding / technical background, interest in projects",
      3: "Interest in grad school, demonstrated project experience",
    },
  },
  {
    key: "qualityScore",
    label: "Quality/Creativity",
    levels: {
      1: "Zero effort answers",
      2: "Unoriginal / not well thought out",
      3: "Unique + well described",
    },
  },
  {
    key: "overallScore",
    label: "Overall Recommendation",
    levels: {
      1: "Definitely no",
      2: "Leaning no",
      3: "Leaning yes",
      4: "Definitely yes",
    },
  },
] as const;

export function overallScore(review: Review): number {
  return (
    review.experienceScore +
    review.qualityScore +
    review.researchScore
  );
}

export function averageScores(reviews: Review[]):
| {
    experienceScore: number;
    researchScore: number;
    qualityScore: number;
    overall: number;
}
| null {
    const n = reviews.length;

    if (n === 0) return null;

    const overall =
        reviews.reduce(
            (sum, r) => sum + r.overallScore,
            0
        ) / n;

    const experience =
        reviews.reduce(
            (sum, r) => sum + r.experienceScore,
            0
        ) / n;

    const research =
        reviews.reduce(
            (sum, r) => sum + r.researchScore,
            0
        ) / n;

    const quality =
        reviews.reduce(
            (sum, r) => sum + r.qualityScore,
            0
        ) / n;

    return {
        experienceScore: experience,
        researchScore: research,
        qualityScore: quality,
        overall,
    };
}

// Check if this reviewer's email is in the list of submitted reviews.
export function hasSubmittedReview(
  reviews: Review[],
  reviewerEmail: string
): boolean {
  return reviews.some(
    (r) => r.reviewerEmail === reviewerEmail
  );
}

// Only make other reviews visible once this reviewer has submitted their own review.
export function visibleReviews(
  reviews: Review[],
  reviewerEmail: string
): Review[] {
  return hasSubmittedReview(
    reviews,
    reviewerEmail
  )
    ? reviews
    : [];
}