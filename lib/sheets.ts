import { google } from "googleapis";

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

