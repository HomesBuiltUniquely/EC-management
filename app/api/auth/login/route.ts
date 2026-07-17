import { NextResponse } from "next/server";
import { validateUser } from "@/app/lib/auth";
import { validateHubInteriorEmail } from "@/app/lib/emailRules";
import { encodeSessionUser } from "@/app/lib/session";

const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const email = typeof body.email === "string" ? body.email : "";
        const password = typeof body.password === "string" ? body.password : "";

        const emailError = validateHubInteriorEmail(email);
        if (emailError) {
            return NextResponse.json({ error: emailError }, { status: 400 });
        }

        const user = await validateUser(email, password);
        if (!user) {
            return NextResponse.json(
                { error: "Invalid email or password." },
                { status: 401 }
            );
        }

        const response = NextResponse.json({
            user: {
                name: user.name,
                role: user.role,
                email: user.email,
                branch: user.branch,
            },
        });

        response.cookies.set("ec-auth", "true", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: SESSION_MAX_AGE,
        });

        response.cookies.set(
            "ec-user",
            encodeSessionUser({
                name: user.name,
                role: user.role,
                email: user.email,
                branch: user.branch,
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
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
