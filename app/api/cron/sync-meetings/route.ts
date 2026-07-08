import { NextRequest, NextResponse } from "next/server";
import { syncMeetings } from "@/app/lib/integrations/syncMeetings";

function isAuthorized(request: NextRequest): boolean {
    const secret = (process.env.CRON_SECRET || "").trim();
    if (!secret) return false;

    const auth = request.headers.get("authorization") || "";
    if (auth === `Bearer ${secret}`) return true;

    const querySecret = request.nextUrl.searchParams.get("secret") || "";
    return querySecret === secret;
}

export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json(
            { success: false, error: "Unauthorized" },
            { status: 401 }
        );
    }

    try {
        const result = await syncMeetings();
        return NextResponse.json(result);
    } catch (error) {
        console.error("[cron/sync-meetings]", error);
        const message = error instanceof Error ? error.message : "Sync failed";
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}
