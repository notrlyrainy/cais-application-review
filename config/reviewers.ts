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

export const GUEST_REVIEWER = {
    name: "Guest",
    email: "guest@usc.edu",
};

export const LOGIN_USERS = [
    ...REVIEWERS,
    GUEST_REVIEWER,
];

export function reviewerName(email: string): string {
    return LOGIN_USERS.find((r) => r.email === email)?.name ?? email;
}