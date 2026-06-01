export function toDateKey(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function getTodayKey(): string {
    return toDateKey(new Date());
}

export function getYesterdayKey(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toDateKey(d);
}

export function getCurrentMonthKey(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDateKeyLabel(dateKey: string): string {
    const [y, m, day] = dateKey.split("-");
    const d = new Date(Number(y), Number(m) - 1, Number(day));
    return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatMonthKeyLabel(monthKey: string): string {
    const [y, m] = monthKey.split("-");
    const d = new Date(Number(y), Number(m) - 1, 1);
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export function dateKeyInMonth(dateKey: string, monthKey: string): boolean {
    return dateKey.startsWith(`${monthKey}-`);
}

export function formatCompletedTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export function formatTimeArrived(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
    });
}

export function formatWaitNote(arrivedAt: number): string | undefined {
    const mins = Math.floor((Date.now() - arrivedAt) / 60000);
    if (mins < 5) return undefined;
    return `(${mins}m wait)`;
}
