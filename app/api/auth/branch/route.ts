import { NextRequest, NextResponse } from "next/server";
import { isEcBranch } from "@/app/lib/branches";
import {
    encodeSessionUser,
    getSessionFromRequest,
    isAdmin,
} from "@/app/lib/session";

const SESSION_MAX_AGE = 60 * 60 * 8;

export async function POST(request: NextRequest) {
    const session = getSessionFromRequest(request);
    if (!session) {
        return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (!isAdmin(session)) {
        return NextResponse.json(
            { error: "Only admins can switch branches." },
            { status: 403 }
        );
    }

    try {
        const body = await request.json();
        const branch = body.branch;
        if (!isEcBranch(branch)) {
            return NextResponse.json(
                { error: "Select a valid branch." },
                { status: 400 }
            );
        }

        const response = NextResponse.json({ success: true, branch });
        response.cookies.set(
            "ec-user",
            encodeSessionUser({
                name: session.name,
                role: session.role,
                email: session.email,
                branch,
            }),
            {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: SESSION_MAX_AGE,
            }
        );

        return response;
    } catch {
        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        );
    }
}
