"use client";

import { useRooms } from "../context/RoomContext";
import { FloorRoomCard } from "./FloorRoomCard";
import { RoomStatus } from "./Type/FloorRoomType";

const legendItems = [
    { label: "Occupied", color: "bg-red-500", status: RoomStatus.InUse },
    { label: "Available", color: "bg-green-500", status: RoomStatus.Open },
    { label: "Reserved", color: "bg-amber-400", status: RoomStatus.Waiting },
];

export function Section2() {
    const { rooms, stats } = useRooms();

    return (
        <section className="mx-auto mt-10 max-w-7xl px-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                    <h2 className="text-lg font-bold text-gray-900">EC Floor View (Live Status)</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {legendItems.map((item) => (
                        <div key={item.label} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                            {item.label}
                            <span className="text-xs text-gray-400">
                                ({rooms.filter((r) => r.status === item.status).length})
                            </span>
                        </div>
                    ))}
                    <span className="text-xs text-gray-400">
                        {stats.open} free · {stats.inUse} in use
                    </span>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {rooms.map((room) => (
                    <FloorRoomCard key={room.id} room={room} />
                ))}
            </div>
        </section>
    );
}
