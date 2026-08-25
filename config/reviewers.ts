export const REVIEWERS = [
    { name: "Ruina", email: "ruinaliu@usc.edu"},
    { name: "Annie", email: "anniegao@usc.edu" },
    { name: "Alvin", email: "tanalvin@usc.edu" },
    { name: "Shreeya", email: "sachand@usc.edu" },
    { name: "Natasha", email: "thombre@usc.edu" },
    { name: "Ray", email: "zhangray@usc.edu" },
    { name: "Ruwan", email: "thoumoun@usc.edu" },
    { name: "Siya", email: "siyaaror@usc.edu" },
];

export function reviewerName(email: string): string {
    return REVIEWERS.find((r) => r.email === email)?.name ?? email;
}