import type { WalkInRecord } from "../../Component/Type/VisitType";
import { createEmptyRequirements } from "../../Component/Type/WalkInFormConfig";
import type { ExternalMeetingListItem, MeetingSource } from "./types";
import { meetingArrivedAt, parseSlotTimes } from "./meetingTime";

function buildInterest(
    source: MeetingSource,
    item: ExternalMeetingListItem
): string {
    const branch = item.branch?.trim();
    if (source === "crm") {
        const parts = ["Showroom Visit", item.crmName?.trim(), branch].filter(Boolean);
        return parts.join(" · ");
    }
    const parts = [item.milestoneName?.trim() || "Design Meeting", branch].filter(Boolean);
    return parts.join(" · ");
}

function visitTypeFor(source: MeetingSource, item: ExternalMeetingListItem): string {
    if (source === "crm") return "Showroom Visit";
    return item.milestoneName?.trim() || "Design Meeting";
}

export function externalMeetingToWalkIn(
    source: MeetingSource,
    item: ExternalMeetingListItem
): WalkInRecord {
    const { start, end } = parseSlotTimes(item.slots);
    const meetingDate = item.meetingDate?.trim() || item.createdAt.slice(0, 10);
    const id = `${source}-${item.appointmentId}`;

    return {
        id,
        designer: item.designerName?.trim() || "—",
        formDate: meetingDate,
        name: item.clientName?.trim() || "Customer",
        email: "",
        phone: "—",
        budget: "—",
        requirements: createEmptyRequirements(),
        interest: buildInterest(source, item),
        arrivedAt: meetingArrivedAt(meetingDate, item.slots, item.createdAt),
        dateKey: meetingDate,
        status: "Waiting",
        isScheduled: true,
        scheduleTime: start || undefined,
        scheduleEnd: end || undefined,
        source,
        externalAppointmentId: item.appointmentId,
        leadId: item.leadId?.trim() || undefined,
        crmName: source === "crm" ? item.crmName?.trim() || undefined : undefined,
        milestoneName:
            source === "design" ? item.milestoneName?.trim() || undefined : undefined,
        branch: item.branch?.trim() || undefined,
        visitType: visitTypeFor(source, item),
    };
}
