"use client";

import { useEffect, useState } from "react";
import { useRooms } from "../context/RoomContext";
import { formatElapsed } from "../lib/roomUtils";

const accentCycle = [
    { badge: "bg-blue-100 text-blue-700", bar: "bg-blue-500" },
    { badge: "bg-purple-100 text-purple-700", bar: "bg-purple-500" },
];

export function CurrentMeetings() {
    const { inUseRooms } = useRooms();
    const [, setTick] = useState(0);

    useEffect(() => {
        const id = setInterval(() => setTick((t) => t + 1), 60000);
        return () => clearInterval(id);
    }, []);

    if (inUseRooms.length === 0) {
        return (
            <p className="py-8 text-center text-sm text-gray-400">
                No active meetings. Book a free room to get started.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {inUseRooms.map((room, index) => {
                const accent = accentCycle[index % accentCycle.length];
                const elapsed = room.bookedAt
                    ? formatElapsed(room.bookedAt)
                    : room.elapsed ?? "—";

                return (
                    <div key={room.id} className="rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <span className={`rounded px-2 py-0.5 text-xs font-bold ${accent.badge}`}>
                                {room.name.toUpperCase()}
                            </span>
                            <span className="text-xs font-semibold text-red-500">● Live</span>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
                                {room.initials}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{room.leadName}</p>
                                {room.withName && (
                                    <p className="text-xs text-gray-500">w/ {room.withName}</p>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                            <div className={`h-full w-2/3 rounded-full ${accent.bar}`} />
                        </div>
                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                            <span>Elapsed: {elapsed}</span>
                            <span>Est: {room.endT ?? "—"}</span>
                        </div>
                        {room.bookedBy && (
                            <p className="mt-1 text-xs text-gray-400">Booked by {room.bookedBy}</p>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
