/** Parse "11:00 AM - 12:30 PM" or en-dash variants into start/end times. */
export function parseSlotTimes(slots: string): { start: string; end?: string } {
    const raw = String(slots || "").trim();
    if (!raw) return { start: "" };

    const parts = raw.split(/\s*[-–—]\s*/);
    if (parts.length >= 2) {
        return { start: parts[0].trim(), end: parts[1].trim() };
    }
    return { start: raw };
}

/** Combine meeting date + slot start into epoch ms for queue ordering/display. */
export function meetingArrivedAt(meetingDate: string, slots: string, createdAt?: string): number {
    const { start } = parseSlotTimes(slots);
    if (meetingDate && start) {
        const parsed = new Date(`${meetingDate} ${start}`);
        if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
    }
    if (createdAt) {
        const normalized = createdAt.includes("T")
            ? createdAt
            : createdAt.replace(" ", "T");
        const parsed = new Date(normalized);
        if (!Number.isNaN(parsed.getTime())) return parsed.getTime();
    }
    return Date.now();
}

export function defaultSinceDaysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
        `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
    );
}

export function maxIsoLocalDateTime(values: string[], fallback: string): string {
    if (!values.length) return fallback;
    return values.reduce((max, value) => (value > max ? value : max), values[0]);
}
