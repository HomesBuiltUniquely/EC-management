export const EC_BRANCHES = ["HBR", "Sarjapura", "JP Nagar"] as const;

export type EcBranch = (typeof EC_BRANCHES)[number];

export const DEFAULT_EC_BRANCH: EcBranch = "HBR";

export function isEcBranch(value: unknown): value is EcBranch {
    return typeof value === "string" && EC_BRANCHES.includes(value as EcBranch);
}

export function normalizeEcBranch(value: unknown): EcBranch | null {
    if (isEcBranch(value)) return value;
    if (typeof value !== "string") return null;

    const normalized = value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    if (normalized.includes("sarjapur")) return "Sarjapura";
    if (normalized.includes("jpnagar") || normalized === "jp") return "JP Nagar";
    if (normalized.includes("hbr")) return "HBR";
    return null;
}
