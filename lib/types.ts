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

export type AssignmentStatus =
  | "assigned"
  | "recused"
  | "completed"
  | "reassigned";

export type Assignment = {
  uscId: string,
  reviewerEmail: string,
  status: AssignmentStatus
};

export type ReviewScore = 1 | 2 | 3;

export type OverallScore = 1 | 2 | 3 | 4;

export type Review = {
  uscId: string,
  reviewerEmail: string,
  experienceScore: ReviewScore,
  researchScore: ReviewScore,
  qualityScore: ReviewScore,
  overallScore: OverallScore,
  notes: string,
  submittedAt: string
};

export type DecisionValue =
  | "accepted"
  | "rejected"
  | "undecided";

export type Decision = {
  uscId: string;
  decision: DecisionValue;
  notes: string;
};