export type Application = {
    timestamp: string,
    email: string,
    name: string,
    uscId: string,
    phone: string,
    pronouns: string,
    year: string,
    majorMinor: string,
    coursework: string,
    howHeard: string,
    links: string,
    whyJoin: string,
    aiResponse: string,
    experienceResponse: string,
    socialResponse: string,
    passionResponse: string,
    availability: string,
    maybeExplanation: string,
    notifsReaction: string
};

export type AssignmentStatus = "assigned" | "recused" | "completed";

export type Assignment = {
  uscId: string,
  reviewerEmail: string,
  status: AssignmentStatus
};

export type ReviewScore = 1 | 2 | 3;

export type Review = {
    uscId: string,
    reviewerEmail: string,
    experienceScore: ReviewScore,
    researchScore: ReviewScore,
    qualityScore: ReviewScore,
    notes: string,
    submittedAt: string
};