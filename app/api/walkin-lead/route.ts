import { NextResponse } from "next/server";
import {
    buildWalkinLeadPayload,
    getWalkinLeadApiBaseUrl,
} from "@/app/lib/walkinLeadApi";
import type { WalkInFormInput } from "@/app/Component/Type/VisitType";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as WalkInFormInput;

        if (!body.name?.trim() || !body.email?.trim() || !body.phone?.trim()) {
            return NextResponse.json(
                { error: "Name, email, and contact number are required." },
                { status: 400 }
            );
        }

        const payload = buildWalkinLeadPayload(body);
        const url = `${getWalkinLeadApiBaseUrl()}/v1/WalkinLead`;

        console.log("[WalkinLead] Forwarding to:", url);
        console.log("[WalkinLead] Payload:", JSON.stringify(payload, null, 2));

        const upstream = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const text = await upstream.text();
        console.log("[WalkinLead] Upstream status:", upstream.status);
        console.log("[WalkinLead] Upstream body:", text.slice(0, 500));
        let data: unknown = null;
        if (text) {
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text };
            }
        }

        if (!upstream.ok) {
            const message =
                typeof data === "object" &&
                data !== null &&
                "error" in data &&
                typeof (data as { error: unknown }).error === "string"
                    ? (data as { error: string }).error
                    : typeof data === "object" &&
                        data !== null &&
                        "message" in data &&
                        typeof (data as { message: unknown }).message ===
                            "string"
                      ? (data as { message: string }).message
                      : `Walk-in API failed (${upstream.status})`;

            return NextResponse.json({ error: message }, { status: upstream.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        const message =
            error instanceof Error
                ? error.message
                : "Unable to reach walk-in API.";
        return NextResponse.json(
            {
                error:
                    message.includes("fetch failed") ||
                    message.includes("ECONNREFUSED")
                        ? "Could not connect to walk-in service. Is the API running on port 8081?"
                        : message,
            },
            { status: 502 }
        );
    }
}
