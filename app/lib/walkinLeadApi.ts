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

export function getWalkinLeadApiBaseUrl(): string {
    return (
        process.env.WALKIN_LEAD_API_URL?.replace(/\/$/, "") ??
        "https://hows.hubinterior.com"
    );
}
