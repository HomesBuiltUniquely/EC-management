import { NextRequest, NextResponse } from "next/server";
import {
    createReceptionist,
    listReceptionists,
} from "@/app/lib/auth";
import { getSessionFromRequest, isAdmin } from "@/app/lib/session";

export async function GET(request: NextRequest) {
    const session = getSessionFromRequest(request);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const receptionists = await listReceptionists();
    return NextResponse.json({ receptionists });
}

export async function POST(request: NextRequest) {
    const session = getSessionFromRequest(request);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    try {
        const body = await request.json();
        const name = typeof body.name === "string" ? body.name : "";
        const email = typeof body.email === "string" ? body.email : "";
        const password = typeof body.password === "string" ? body.password : "";

        const result = await createReceptionist({ name, email, password });
        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({ receptionist: result.user });
    } catch {
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}
