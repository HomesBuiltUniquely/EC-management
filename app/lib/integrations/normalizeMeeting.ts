import type { ScheduledMeeting, WalkInRecord } from "../../Component/Type/VisitType";
import type { ExternalMeetingListItem, MeetingSource } from "./types";
import { meetingArrivedAt, parseSlotTimes } from "./meetingTime";
import { normalizeEcBranch } from "../branches";

/** True when the receptionist submitted the walk-in form (not a CRM/Design sync). */
export function isFormFilledWalkIn(w: Pick<WalkInRecord, "source">): boolean {
    return w.source !== "crm" && w.source !== "design";
}

export function isSyncedMeetingId(id: string): boolean {
    return id.startsWith("crm-") || id.startsWith("design-");
}

export function externalMeetingToScheduled(
    source: MeetingSource,
    item: ExternalMeetingListItem
): ScheduledMeeting {
    const { start, end } = parseSlotTimes(item.slots);
    const meetingDate = item.meetingDate?.trim() || item.createdAt.slice(0, 10);
    const id = `${source}-${item.appointmentId}`;
    const branch = normalizeEcBranch(item.branch);

    return {
        id,
        leadName: item.clientName?.trim() || "Customer",
        withName: item.designerName?.trim() || undefined,
        startT: start || "TBD",
        endT: end || "TBD",
        scheduledAt: meetingArrivedAt(meetingDate, item.slots, item.createdAt),
        dateKey: meetingDate,
        confirmed: false,
        branch: branch ?? undefined,
    };
}
