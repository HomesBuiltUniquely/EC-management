export enum MeetingRoom {
    Room1 = "Room 1",
    Room2 = "Room 2",
    Room3 = "Room 3",
    Room4 = "Boardroom",
    Room5 = "Pavillion 2.0",
}

export enum MeetingTag {
    InUse = "In use",
    Open = "Open",
    Waiting = "WAITING",
}

export type MeetingObject = {
    id: number;
    name: MeetingRoom;
    LeadName: string;
    Tag: MeetingTag;
    StartT: string;
    EndT: string;
    ClassName?: string;
    TagClassName?: string;
};

/** @deprecated Legacy sample data — floor state comes from RoomContext */
export const meetings: MeetingObject[] = [];
