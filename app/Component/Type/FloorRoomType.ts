import { DEFAULT_EC_BRANCH, type EcBranch } from "../../lib/branches";

export enum RoomStatus {
    InUse = "IN USE",
    Open = "OPEN",
    Waiting = "WAITING",
    Maintenance = "MAINTENANCE",
}

export type FloorRoom = {
    id: number;
    name: string;
    status: RoomStatus;
    leadName?: string;
    withName?: string;
    initials?: string;
    subtitle?: string;
    elapsed?: string;
    endsAt?: string;
    waitTime?: string;
    availableIn?: string;
    bookedAt?: number;
    startT?: string;
    endT?: string;
    bookedBy?: string;
};

export type RoomBookingInput = {
    leadName: string;
    withName?: string;
    startT: string;
    endT: string;
};

const ROOM_NAMES: Record<EcBranch, string[]> = {
    HBR: ["Room 1", "Room 2", "Room 3", "Boardroom", "Pavillion 2.0"],
    Sarjapura: [
        "Meeting Room 1",
        "Meeting Room 2",
        "Meeting Room 3",
        "Meeting Room 4",
        "Board Room",
    ],
    "JP Nagar": [
        "Meeting Room 1",
        "Meeting Room 2",
        "Meeting Room 3",
        "Meeting Room 4",
        "GF Meeting Room",
        "GF Open Room",
    ],
};

export function getDefaultFloorRooms(
    branch: EcBranch = DEFAULT_EC_BRANCH
): FloorRoom[] {
    return ROOM_NAMES[branch].map((name, index) => ({
        id: index + 1,
        name,
        status: RoomStatus.Open,
    }));
}

/** @deprecated Use getDefaultFloorRooms() via RoomContext */
export const floorRooms = getDefaultFloorRooms();
