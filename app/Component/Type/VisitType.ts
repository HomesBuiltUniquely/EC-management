import type { RoomRequirements } from "./WalkInFormConfig";

export type WalkInRecord = {
    id: string;
    designer: string;
    formDate: string;
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    expectedMoveIn?: string;
    residingAddress?: string;
    propertyName?: string;
    propertyAddress?: string;
    propertyType?: string;
    propertyUse?: string;
    budget: string;
    possession?: string;
    requirements: RoomRequirements;
    interest: string;
    arrivedAt: number;
    dateKey: string;
    status: "Waiting" | "In Discussion" | "Assigned" | "Meeting Done";
    assignedRoomId?: number;
    assignedRoomName?: string;
    isScheduled: boolean;
    scheduleTime?: string;
    scheduleEnd?: string;
    /** manual | crm | design */
    source?: "manual" | "crm" | "design";
    externalAppointmentId?: number;
    leadId?: string;
    crmName?: string;
    milestoneName?: string;
    branch?: string;
    visitType?: string;
    /** @deprecated kept for older saved records */
    address?: string;
    leadSources?: string[];
};

export type ScheduledMeeting = {
    id: string;
    leadName: string;
    withName?: string;
    roomName?: string;
    startT: string;
    endT: string;
    scheduledAt: number;
    dateKey: string;
    confirmed: boolean;
    walkInId?: string;
};

export type CompletedMeeting = {
    id: string;
    roomName: string;
    leadName: string;
    withName?: string;
    completedAt: number;
    dateKey: string;
};

export type WalkInFormInput = {
    designer: string;
    formDate: string;
    name: string;
    email: string;
    phone: string;
    alternatePhone?: string;
    expectedMoveIn?: string;
    residingAddress?: string;
    propertyName?: string;
    propertyAddress?: string;
    propertyType?: string;
    propertyUse?: string;
    budget: string;
    possession?: string;
    requirements: RoomRequirements;
    scheduleTime?: string;
    scheduleEnd?: string;
};

export type WalkInQueueRow = {
    id: string;
    initials: string;
    name: string;
    email: string;
    phone: string;
    interest: string;
    arrived: string;
    waitNote?: string;
    type: string;
    status: WalkInRecord["status"];
    assignedRoomName?: string;
    action: string;
};
