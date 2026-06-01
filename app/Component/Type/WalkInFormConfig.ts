export const PROPERTY_TYPES = [
    "Apartment",
    "Villa",
    "Independent",
    "Duplex",
    "Penthouse",
] as const;

export const PROPERTY_USES = ["Own", "Rental", "Others"] as const;

export const ROOM_REQUIREMENT_ITEMS: Record<string, string[]> = {
    Kitchen: [
        "Shape",
        "Finish",
        "Appliances",
        "Counter Top",
        "Loft",
        "Automation",
        "Furniture",
        "Accessories",
        "Utility",
    ],
    "Living Room": [
        "Entertainment Unit",
        "Crockery Unit",
        "Dining Room",
        "False Ceiling",
        "Painting",
        "Automation",
        "Furniture",
        "Pooja Unit",
        "Wallpaper",
    ],
    Foyer: [
        "Shoe Rack",
        "Painting",
        "False Ceiling",
        "Wallpaper",
        "Furniture",
        "Lighting",
    ],
    "Master Bedroom": [
        "Wardrobe",
        "Loft",
        "Study Unit",
        "Entertainment Unit",
        "Automation",
        "Wallpaper",
        "Painting",
        "Furniture",
        "False Ceiling",
    ],
    "Guest Bedroom": [
        "Wardrobe",
        "Loft",
        "Study Unit",
        "Entertainment Unit",
        "Automation",
        "Wallpaper",
        "Painting",
        "Furniture",
        "False Ceiling",
    ],
    "Bedroom/Others": [
        "Wardrobe",
        "Loft",
        "Study Unit",
        "Entertainment Unit",
        "Automation",
        "Wallpaper",
        "Painting",
        "Furniture",
        "False Ceiling",
    ],
};

export type RequirementItem = {
    selected: boolean;
    note?: string;
};

export type RoomRequirements = Record<string, Record<string, RequirementItem>>;

export function createEmptyRequirements(): RoomRequirements {
    const requirements: RoomRequirements = {};
    for (const [room, items] of Object.entries(ROOM_REQUIREMENT_ITEMS)) {
        requirements[room] = {};
        for (const item of items) {
            requirements[room][item] = { selected: false, note: "" };
        }
    }
    return requirements;
}

export function getSelectedRequirementsSummary(
    requirements: RoomRequirements
): string {
    const rooms = Object.entries(requirements)
        .filter(([, items]) =>
            Object.values(items).some((entry) => entry?.selected)
        )
        .map(([room]) => room);
    return rooms.length > 0 ? rooms.join(", ") : "General inquiry";
}

/** Migrate legacy boolean-only requirement maps */
export function normalizeRequirements(
    raw?: RoomRequirements | Record<string, Record<string, boolean>>
): RoomRequirements {
    const base = createEmptyRequirements();
    if (!raw) return base;

    for (const [room, items] of Object.entries(raw)) {
        if (!base[room]) continue;
        for (const [item, value] of Object.entries(items)) {
            if (typeof value === "boolean") {
                base[room][item] = { selected: value, note: "" };
            } else if (
                value &&
                typeof value === "object" &&
                "selected" in value
            ) {
                const entry = value as RequirementItem;
                base[room][item] = {
                    selected: Boolean(entry.selected),
                    note: entry.note ?? "",
                };
            }
        }
    }
    return base;
}
