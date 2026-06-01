import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export type SessionUser = {
    name: string;
    role: string;
    email: string;
};

export function parseSessionUser(
    cookieValue: string | undefined
): SessionUser | null {
    if (!cookieValue) return null;
    try {
        return JSON.parse(decodeURIComponent(cookieValue)) as SessionUser;
    } catch {
        return null;
    }
}

export function getSessionFromRequest(request: NextRequest): SessionUser | null {
    return parseSessionUser(request.cookies.get("ec-user")?.value);
}

export async function getServerSession(): Promise<SessionUser | null> {
    const cookieStore = await cookies();
    return parseSessionUser(cookieStore.get("ec-user")?.value);
}

export function isAdmin(user: SessionUser | null): boolean {
    return user?.role === "Admin";
}
