import { NextRequest, NextResponse } from "next/server";
import {
    loadDashboardFromDb,
    saveDashboardToDb,
    type DashboardData,
} from "@/app/lib/db/dashboard";
import { getSessionFromRequest } from "@/app/lib/session";

function dbUnavailableMessage(error: unknown): string {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("Can't reach database") || msg.includes("ECONNREFUSED")) {
        return "Cannot connect to MySQL. Check DATABASE_URL and that MySQL is running.";
    }
    if (msg.includes("does not exist") || msg.includes("Unknown database")) {
        return "Database not found. Run: npm run db:init";
    }
    return msg;
}

export async function GET(request: NextRequest) {
    const session = getSessionFromRequest(request);
    if (!session) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    try {
        const data = await loadDashboardFromDb(session.branch);
        return NextResponse.json(data);
    } catch (error) {
        console.error("[dashboard GET]", error);
        return NextResponse.json(
            { error: dbUnavailableMessage(error) },
            { status: 503 }
        );
    }
}

export async function PUT(request: NextRequest) {
    const session = getSessionFromRequest(request);
    if (!session) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    try {
        const body = (await request.json()) as DashboardData;
        if (!body.rooms || !Array.isArray(body.walkIns)) {
            return NextResponse.json(
                { error: "Invalid dashboard payload." },
                { status: 400 }
            );
        }

        await saveDashboardToDb(session.branch, {
            rooms: body.rooms,
            walkIns: body.walkIns ?? [],
            scheduled: body.scheduled ?? [],
            completed: body.completed ?? [],
            feedbacks: body.feedbacks ?? [],
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[dashboard PUT]", error);
        return NextResponse.json(
            { error: dbUnavailableMessage(error) },
            { status: 503 }
        );
    }
}
