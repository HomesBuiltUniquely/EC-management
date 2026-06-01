export const HUB_EMAIL_DOMAIN = "@hubinterior.com";

export function normalizeHubEmail(email: string): string {
    return email.trim().toLowerCase();
}

export function isHubInteriorEmail(email: string): boolean {
    const normalized = normalizeHubEmail(email);
    return /^[^\s@]+@hubinterior\.com$/.test(normalized);
}

export function validateHubInteriorEmail(email: string): string | null {
    const normalized = normalizeHubEmail(email);
    if (!normalized) {
        return "Email is required.";
    }
    if (!isHubInteriorEmail(normalized)) {
        return `Email must end with ${HUB_EMAIL_DOMAIN}`;
    }
    return null;
}
