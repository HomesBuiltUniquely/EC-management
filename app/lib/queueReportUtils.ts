import type { MeetingFeedbackRecord } from "../Component/Type/FeedbackType";
import type {
    CompletedMeeting,
    ScheduledMeeting,
    WalkInQueueRow,
    WalkInRecord,
} from "../Component/Type/VisitType";
import {
    dateKeyInMonth,
    formatCompletedTime,
    formatDateKeyLabel,
    formatMonthKeyLabel,
    formatTimeArrived,
    formatWaitNote,
    getTodayKey,
    getYesterdayKey,
} from "./dateUtils";
import { getInitials } from "./roomUtils";

export type QueueDateFilter =
    | { preset: "today" }
    | { preset: "yesterday" }
    | { preset: "day"; date: string }
    | { preset: "month"; month: string };

export type PeriodMeetingRow = {
    id: string;
    client: string;
    designer?: string;
    salesRep?: string;
    room: string;
    time: string;
};

export type QueuePeriodReport = {
    filter: QueueDateFilter;
    periodLabel: string;
    meetingsCompleted: number;
    walkInsTotal: number;
    walkInsWalkIn: number;
    walkInsScheduled: number;
    scheduledSlots: number;
    clients: string[];
    designers: string[];
    salesReps: string[];
    meetings: PeriodMeetingRow[];
    walkIns: WalkInRecord[];
};

export function filterLabel(filter: QueueDateFilter): string {
    switch (filter.preset) {
        case "today":
            return `Today · ${formatDateKeyLabel(getTodayKey())}`;
        case "yesterday":
            return `Yesterday · ${formatDateKeyLabel(getYesterdayKey())}`;
        case "day":
            return formatDateKeyLabel(filter.date);
        case "month":
            return formatMonthKeyLabel(filter.month);
    }
}

function matchesDateKey(dateKey: string, filter: QueueDateFilter): boolean {
    switch (filter.preset) {
        case "today":
            return dateKey === getTodayKey();
        case "yesterday":
            return dateKey === getYesterdayKey();
        case "day":
            return dateKey === filter.date;
        case "month":
            return dateKeyInMonth(dateKey, filter.month);
    }
}

function uniqueNonEmpty(values: (string | undefined)[]): string[] {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const v of values) {
        const t = v?.trim();
        if (!t) continue;
        const key = t.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(t);
    }
    return out.sort((a, b) => a.localeCompare(b));
}

export function buildQueuePeriodReport(
    filter: QueueDateFilter,
    data: {
        walkIns: WalkInRecord[];
        completed: CompletedMeeting[];
        feedbacks: MeetingFeedbackRecord[];
        scheduled: ScheduledMeeting[];
    }
): QueuePeriodReport {
    const periodWalkIns = data.walkIns.filter((w) =>
        matchesDateKey(w.dateKey, filter)
    );
    const periodCompleted = data.completed.filter((c) =>
        matchesDateKey(c.dateKey, filter)
    );
    const periodFeedbacks = data.feedbacks.filter((f) =>
        matchesDateKey(f.dateKey, filter)
    );
    const periodScheduled = data.scheduled.filter((s) =>
        matchesDateKey(s.dateKey, filter)
    );

    const feedbackByLead = new Map<string, MeetingFeedbackRecord>();
    for (const f of periodFeedbacks) {
        const key = f.leadName.trim().toLowerCase();
        if (!feedbackByLead.has(key)) feedbackByLead.set(key, f);
    }

    const meetings: PeriodMeetingRow[] = periodCompleted.map((c) => {
        const fb = feedbackByLead.get(c.leadName.trim().toLowerCase());
        return {
            id: c.id,
            client: c.leadName,
            designer: fb?.designerName?.trim() || c.withName?.trim(),
            salesRep: fb?.salesRepName?.trim(),
            room: c.roomName,
            time: formatCompletedTime(c.completedAt),
        };
    });

    const clients = uniqueNonEmpty([
        ...periodWalkIns.map((w) => w.name),
        ...periodCompleted.map((c) => c.leadName),
        ...periodFeedbacks.map((f) => f.customerName || f.leadName),
    ]);

    const designers = uniqueNonEmpty([
        ...periodWalkIns.map((w) => w.designer),
        ...periodCompleted.map((c) => c.withName),
        ...periodFeedbacks.map((f) => f.designerName),
    ]);

    const salesReps = uniqueNonEmpty(
        periodFeedbacks.map((f) => f.salesRepName)
    );

    return {
        filter,
        periodLabel: filterLabel(filter),
        meetingsCompleted: periodCompleted.length,
        walkInsTotal: periodWalkIns.length,
        walkInsWalkIn: periodWalkIns.filter((w) => !w.isScheduled).length,
        walkInsScheduled: periodWalkIns.filter((w) => w.isScheduled).length,
        scheduledSlots: periodScheduled.length,
        clients,
        designers,
        salesReps,
        meetings,
        walkIns: periodWalkIns.sort((a, b) => b.arrivedAt - a.arrivedAt),
    };
}

export function walkInMatchesFilter(
    dateKey: string,
    filter: QueueDateFilter
): boolean {
    return matchesDateKey(dateKey, filter);
}

export function walkInQueueTypeLabel(w: WalkInRecord): string {
    if (w.visitType?.trim()) return w.visitType.trim();
    if (w.source === "crm") return "Showroom Visit";
    if (w.source === "design") return w.milestoneName?.trim() || "Design Meeting";
    return w.isScheduled ? "Scheduled" : "Walk-in";
}

function walkInArrivedLabel(w: WalkInRecord): string {
    if ((w.source === "crm" || w.source === "design") && w.scheduleTime?.trim()) {
        return w.scheduleTime.trim();
    }
    return formatTimeArrived(w.arrivedAt);
}

export function buildWalkInQueueRows(
    walkIns: WalkInRecord[],
    filter: QueueDateFilter
): WalkInQueueRow[] {
    return walkIns
        .filter((w) => matchesDateKey(w.dateKey, filter))
        .map((w) => ({
            id: w.id,
            initials: getInitials(w.name),
            name: w.name,
            email: w.email,
            phone: w.phone,
            interest: w.interest,
            arrived: walkInArrivedLabel(w),
            waitNote:
                w.source === "crm" || w.source === "design"
                    ? undefined
                    : w.status === "Meeting Done"
                      ? undefined
                      : formatWaitNote(w.arrivedAt),
            type: walkInQueueTypeLabel(w),
            status: w.status,
            assignedRoomName: w.assignedRoomName,
            action:
                w.status === "Meeting Done"
                    ? ""
                    : w.status === "Waiting" ||
                        (w.status === "Assigned" && !w.assignedRoomId)
                      ? "Assign"
                      : w.status === "In Discussion"
                        ? ""
                        : "Details",
        }))
        .reverse();
}
