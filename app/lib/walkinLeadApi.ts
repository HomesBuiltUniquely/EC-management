import type { WalkInFormInput } from "../Component/Type/VisitType";

export type WalkinLeadPayload = {
    customerDetails: {
        name: string;
        contactNo: string;
        emailId: string;
        expectedMoveIn: string;
        alternateContactNo: string;
        residingAddress: string;
    };
    propertyDetails: {
        propertyName: string;
        propertyAddress: string;
        propertyType: string;
        propertyUse: string;
        budget: string;
        possession: string;
    };
    requirements: Record<string, unknown>;
    scheduleMeetingToday: boolean;
};

export function buildWalkinLeadPayload(
    input: WalkInFormInput
): WalkinLeadPayload {
    const hasSchedule = Boolean(input.scheduleTime?.trim());

    return {
        customerDetails: {
            name: input.name.trim(),
            contactNo: input.phone.trim(),
            emailId: input.email.trim(),
            expectedMoveIn: input.expectedMoveIn?.trim() ?? "",
            alternateContactNo: input.alternatePhone?.trim() ?? "",
            residingAddress: input.residingAddress?.trim() ?? "",
        },
        propertyDetails: {
            propertyName: input.propertyName?.trim() ?? "",
            propertyAddress: input.propertyAddress?.trim() ?? "",
            propertyType: input.propertyType ?? "",
            propertyUse: input.propertyUse ?? "",
            budget: input.budget?.trim() ?? "",
            possession: input.possession?.trim() ?? "",
        },
        requirements: input.requirements as Record<string, unknown>,
        scheduleMeetingToday: hasSchedule,
    };
}

/** Base URL of the Java/backend server only — NOT your Vercel or marketing site URL. */
export function getWalkinLeadApiBaseUrl(): string {
    return (
        process.env.WALKIN_LEAD_API_URL?.replace(/\/$/, "") ??
        "https://hows.hubinterior.com"
    );
}

/** Full POST URL, e.g. http://localhost:8081/v1/WalkinLead */
export function getWalkinLeadEndpoint(): string {
    const base = getWalkinLeadApiBaseUrl();
    const path =
        process.env.WALKIN_LEAD_API_PATH?.replace(/^\/?/, "/") ??
        "/v1/WalkinLead";
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
