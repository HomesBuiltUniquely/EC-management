import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import {
    DEFAULT_EC_BRANCH,
    normalizeEcBranch,
    type EcBranch,
} from "./branches";

export type SessionUser = {
    name: string;
    role: string;
    email: string;
    branch: EcBranch;
};

function sessionSecret(): string {
    return process.env.EC_AUTH_SALT ?? "ec-hows-salt";
}

function sign(payload: string): string {
    return createHmac("sha256", sessionSecret())
        .update(payload)
        .digest("base64url");
}

export function encodeSessionUser(user: SessionUser): string {
    const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
    return `${payload}.${sign(payload)}`;
}

export function parseSessionUser(
    cookieValue: string | undefined
): SessionUser | null {
    if (!cookieValue) return null;
    try {
        const [payload, signature] = cookieValue.split(".");
        if (!payload || !signature) return null;
        const expected = sign(payload);
        const actualBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expected);
        if (
            actualBuffer.length !== expectedBuffer.length ||
            !timingSafeEqual(actualBuffer, expectedBuffer)
        ) {
            return null;
        }
        const parsed = JSON.parse(
            Buffer.from(payload, "base64url").toString("utf8")
        ) as Omit<SessionUser, "branch"> & { branch?: string };
        return {
            ...parsed,
            branch: normalizeEcBranch(parsed.branch) ?? DEFAULT_EC_BRANCH,
        };
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
