import { Review } from "./types"

export const CRITERIA = [
    {
        key: "experienceScore",
        label: "Experience",
        levels: {
            1: "Little to no experience/understanding of ML",
            2: "Some degree of ML background",
            3: "Has conducted AI research",
        },
    },
    {
        key: "researchScore",
        label: "Research",
        levels: {
            1: "Zero demonstrated interest in research",
            2: "Some curiosity, but vague or unfocused",
            3: "Explicitly expresses research interests and motivation",
        },
    },
    {
        key: "qualityScore",
        label: "Quality/Creativity",
        levels: {
            1: "Zero effort answers",
            2: "Unoriginal/Not well thought out",
            3: "Unique + Well Described",
        },
    },

]


export function overallScore(review: Review): number {
    return review.experienceScore + review.qualityScore + review.researchScore;
}

export function averageScores(reviews: Review[]):
| { experienceScore: number; researchScore: number; qualityScore: number; overall: number } 
| null {
    const n = reviews.length;
    if (n === 0) return null;

    const total = reviews.reduce((sum, r) => sum + overallScore(r), 0)/n;
    const experience = reviews.reduce((sum, r) => sum + r.experienceScore, 0)/n;
    const research = reviews.reduce((sum, r) => sum + r.researchScore, 0)/n;
    const quality = reviews.reduce((sum, r) => sum + r.qualityScore, 0)/n;
    return { experienceScore: experience, researchScore: research, qualityScore: quality, overall: total };
}

//check if this reviewer's email is in the list of submitted reviews
export function hasSubmittedReview(reviews: Review[], reviewerEmail: string): boolean {
    return reviews.some((r) => r.reviewerEmail === reviewerEmail);
}

//only make other reviews visible once this reviewer has submitted their own review
export function visibleReviews(reviews: Review[], reviewerEmail: string): Review[] {
    return hasSubmittedReview(reviews, reviewerEmail) ? reviews : [];
}