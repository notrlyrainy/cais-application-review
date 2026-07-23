import { google } from "googleapis";
import { Application, Assignment, AssignmentStatus, Review, ReviewScore } from "./types";

function getSheetsClient() {
    const auth = new google.auth.JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    return google.sheets({version: "v4", auth });
}


export async function getRows(spreadsheetId: string, range: string): Promise<string[][]> {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({ spreadsheetId, range});
    return res.data.values ?? [];
}


function rowsToObjects<T>(
    rows: string[][],
    mapRow: (get: (header: string) => string) => T,
    dataStartsAt: number = 1
): T[] {
    const keyRow = rows[0] ?? []; //header row
    const headers = keyRow.map((h) => h.trim().toLowerCase());
    const dataRows = rows.slice(dataStartsAt);

    return dataRows.map((row) => {
        const get = (header: string) => {
            const index = headers.indexOf(header.trim().toLowerCase());
            return index === -1 ? "" : (row[index] ?? "");
        };
        return mapRow(get);
    })
}


export async function getApplications(): Promise<Application[]> {
    const rows = await getRows(process.env.SHEET_ID!, "Applications");
    return rowsToObjects<Application>(
        rows,
        (get) => ({
            timestamp: get("timestamp"),
            email: get("email"),
            name: get("name"),
            uscId: get("usc_id"),
            phone: get("phone"),
            pronouns: get("pronouns"),
            year: get("year"),
            majorMinor: get("major_minor"),
            coursework: get("coursework"),
            howHeard: get("how_heard"),
            links: get("links"),
            whyJoin: get("why_join"),
            aiResponse: get("ai_response"),
            experienceResponse: get("experience_response"),
            socialResponse: get("social_response"),
            passionResponse: get("passion_response"),
            availability: get("meeting_availability"),
            maybeExplanation: get("maybe_explanation"),
            notifsReaction: get("notifs_reaction"),
        }),
        3
    );
}

export async function getAssignments(): Promise<Assignment[]> {
    const rows = await getRows(process.env.SHEET_ID!, "Assignments");
    return rowsToObjects<Assignment>(
        rows,
        (get) => ({
            uscId: get("usc_id"),
            reviewerEmail: get("reviewer_email"),
            status: get("status") as AssignmentStatus,
        }),
    );
}

export async function getReviews(): Promise<Review[]> {
    const rows = await getRows(process.env.SHEET_ID!, "Reviews");
    return rowsToObjects<Review>(
        rows,
        (get) => ({
            uscId: get("usc_id"),
            reviewerEmail: get("reviewer_email"),
            experienceScore: Number(get("experience_score")) as ReviewScore,
            researchScore: Number(get("research_score")) as ReviewScore,
            qualityScore: Number(get("quality_score")) as ReviewScore,
            notes: get("notes"),
            submittedAt: get("submitted_at")
        }),
    )
}