import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const isAuthenticated = request.cookies.get("ec-auth")?.value === "true";
    const { pathname } = request.nextUrl;

    const isLoginPage = pathname === "/login";
    const isDashboard = pathname.startsWith("/dashboard");
    const isPublicAuthApi =
        pathname === "/api/auth/login" || pathname === "/api/auth/logout";
    const isProtectedAuthApi =
        pathname.startsWith("/api/auth/receptionists") ||
        pathname.startsWith("/api/dashboard");

    if (isPublicAuthApi) {
        return NextResponse.next();
    }

    if (isProtectedAuthApi && !isAuthenticated) {
        return NextResponse.json(
            { error: "Authentication required." },
            { status: 401 }
        );
    }

    if (pathname === "/") {
        const url = request.nextUrl.clone();
        url.pathname = isAuthenticated ? "/dashboard" : "/login";
        return NextResponse.redirect(url);
    }

    if (!isAuthenticated && isDashboard) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
    }

    if (isAuthenticated && isLoginPage) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        "/",
        "/login",
        "/dashboard/:path*",
        "/api/auth/receptionists/:path*",
        "/api/dashboard",
    ],
};
