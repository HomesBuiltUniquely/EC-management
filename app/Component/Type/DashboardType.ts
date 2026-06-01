export type WalkInEntry = {
    id: number;
    initials: string;
    name: string;
    arrived: string;
    waitNote?: string;
    type: string;
    status: "Waiting" | "In Discussion" | "Assigned";
    action: string;
};

export type CurrentMeeting = {
    id: number;
    room: string;
    designer: string;
    client: string;
    elapsed: string;
    estimated: string;
    accent: "blue" | "purple";
};

export type QuickAction = {
    id: number;
    label: string;
    iconBg: string;
    iconColor: string;
};

/** @deprecated Sample data — queue comes from RoomContext */
export const walkInQueue: WalkInEntry[] = [];

/** @deprecated Sample data — meetings come from RoomContext */
export const currentMeetings: CurrentMeeting[] = [];

export const quickActions: QuickAction[] = [
    { id: 1, label: "Launch Quiz", iconBg: "bg-purple-100", iconColor: "text-purple-600" },
    { id: 2, label: "Walk-In Form", iconBg: "bg-blue-100", iconColor: "text-blue-600" },
    { id: 3, label: "Create Slot", iconBg: "bg-teal-100", iconColor: "text-teal-600" },
    { id: 4, label: "Mark Complete", iconBg: "bg-green-100", iconColor: "text-green-600" },
];
