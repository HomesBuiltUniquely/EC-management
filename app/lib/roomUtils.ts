import { FloorRoom, RoomStatus } from "../Component/Type/FloorRoomType";

export function getInitials(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function formatElapsed(bookedAt: number): string {
    const minutes = Math.floor((Date.now() - bookedAt) / 60000);
    if (minutes < 1) return "Just started";
    return `${minutes}m elapsed`;
}

export function formatEndsAt(endT: string): string {
    return endT ? `Ends ~${endT}` : "";
}

export function toOpenRoom(room: FloorRoom): FloorRoom {
    return {
        id: room.id,
        name: room.name,
        status: RoomStatus.Open,
    };
}

export function countByStatus(rooms: FloorRoom[], status: RoomStatus): number {
    return rooms.filter((r) => r.status === status).length;
}
