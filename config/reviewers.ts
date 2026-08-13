export const REVIEWERS = [
    { name: "Reviewer 1", email: "reviewer1@usc.edu"},
    { name: "Ruina", email: "ruinaliu@usc.edu"},
];

export function reviewerName(email: string): string {
    return REVIEWERS.find((r) => r.email === email)?.name ?? email;
}