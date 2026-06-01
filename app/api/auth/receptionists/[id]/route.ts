import { NextRequest, NextResponse } from "next/server";
import {
    deactivateReceptionist,
    updateReceptionistPassword,
} from "@/app/lib/auth";
import { getSessionFromRequest, isAdmin } from "@/app/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, context: RouteContext) {
    const session = getSessionFromRequest(request);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { id } = await context.params;
    const result = await deactivateReceptionist(id);
    if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
    const session = getSessionFromRequest(request);
    if (!isAdmin(session)) {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 });
    }

    const { id } = await context.params;

    try {
        const body = await request.json();
        const password =
            typeof body.password === "string" ? body.password : "";

        const result = await updateReceptionistPassword(id, password);
        if (!result.ok) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}
