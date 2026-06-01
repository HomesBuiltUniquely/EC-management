import { MeetingRoom } from "./MeetingType";

export enum RoomStatus {
    InUse = "IN USE",
    Open = "OPEN",
    Waiting = "WAITING",
    Maintenance = "MAINTENANCE",
}

export type FloorRoom = {
    id: number;
    name: MeetingRoom;
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

export function getDefaultFloorRooms(): FloorRoom[] {
    return [
        { id: 1, name: MeetingRoom.Room1, status: RoomStatus.Open },
        { id: 2, name: MeetingRoom.Room2, status: RoomStatus.Open },
        { id: 3, name: MeetingRoom.Room3, status: RoomStatus.Open },
        { id: 4, name: MeetingRoom.Room4, status: RoomStatus.Open },
        { id: 5, name: MeetingRoom.Room5, status: RoomStatus.Open },
    ];
}

/** @deprecated Use getDefaultFloorRooms() via RoomContext */
export const floorRooms = getDefaultFloorRooms();
