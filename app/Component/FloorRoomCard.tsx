"use client";

import { useEffect, useState } from "react";
import { useRooms } from "../context/RoomContext";
import { formatElapsed, formatEndsAt } from "../lib/roomUtils";
import { BookRoomModal } from "./BookRoomModal";
import { MeetingFeedbackForm } from "./MeetingFeedbackForm";
import { FloorRoom, RoomBookingInput, RoomStatus } from "./Type/FloorRoomType";

const statusStyles: Record<
    RoomStatus,
    { card: string; title: string; badge: string }
> = {
    [RoomStatus.InUse]: {
        card: "border-red-200 bg-red-50/60",
        title: "text-red-700",
        badge: "text-red-600",
    },
    [RoomStatus.Open]: {
        card: "border-green-200 bg-green-50/60",
        title: "text-green-700",
        badge: "text-green-600",
    },
    [RoomStatus.Waiting]: {
        card: "border-amber-200 bg-amber-50/60",
        title: "text-amber-700",
        badge: "text-amber-600",
    },
    [RoomStatus.Maintenance]: {
        card: "border-gray-200 bg-gray-50",
        title: "text-gray-600",
        badge: "text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full text-xs",
    },
};

function StatusBadge({ room }: { room: FloorRoom }) {
    const styles = statusStyles[room.status];
    if (room.status === RoomStatus.Maintenance) {
        return (
            <span className={`text-xs font-bold uppercase ${styles.badge}`}>
                {room.status}
            </span>
        );
    }
    return (
        <span className={`text-xs font-bold uppercase ${styles.badge}`}>
            ● {room.status}
        </span>
    );
}

export function FloorRoomCard({ room }: { room: FloorRoom }) {
    const { bookRoom, completeMeetingEnd } = useRooms();
    const [showBookModal, setShowBookModal] = useState(false);
    const [endingRoom, setEndingRoom] = useState<FloorRoom | null>(null);
    const [elapsed, setElapsed] = useState("");

    const styles = statusStyles[room.status];

    useEffect(() => {
        if (room.status !== RoomStatus.InUse || !room.bookedAt) {
            setElapsed("");
            return;
        }
        const update = () => setElapsed(formatElapsed(room.bookedAt!));
        update();
        const id = setInterval(update, 60000);
        return () => clearInterval(id);
    }, [room.status, room.bookedAt]);

    function handleBook(booking: RoomBookingInput, scheduleOnly: boolean) {
        const ok = bookRoom(room.id, booking, scheduleOnly);
        if (!ok) {
            alert(
                scheduleOnly
                    ? "Could not schedule — room must be available."
                    : "This room is not available for booking."
            );
        }
    }

    const endsLabel = room.endT ? formatEndsAt(room.endT) : room.endsAt;

    return (
        <>
            <div
                className={`flex h-52 w-full flex-col rounded-xl border-2 p-4 ${styles.card}`}
            >
                <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-xs font-bold uppercase leading-tight ${styles.title}`}>
                        {room.name.toUpperCase()}
                    </h3>
                    <StatusBadge room={room} />
                </div>

                <div className="mt-3 flex flex-1 flex-col justify-center">
                    {room.status === RoomStatus.InUse && (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-red-600 shadow-sm">
                                {room.initials}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{room.leadName}</p>
                                {room.withName && (
                                    <p className="text-xs text-gray-500">w/ {room.withName}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {room.status === RoomStatus.Open && (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                                    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-sm text-green-600">Ready for use</p>
                        </div>
                    )}

                    {room.status === RoomStatus.Waiting && (
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
                                {room.initials}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{room.leadName}</p>
                                <p className="text-xs text-gray-500">{room.subtitle}</p>
                            </div>
                        </div>
                    )}

                    {room.status === RoomStatus.Maintenance && (
                        <div className="flex flex-col items-center gap-2 text-center">
                            <div className="text-2xl text-gray-400">🧹</div>
                            <p className="text-sm text-gray-500">Cleaning in progress</p>
                        </div>
                    )}
                </div>

                <div className="mt-auto flex items-center justify-between gap-2 text-xs text-gray-500">
                    {room.status === RoomStatus.InUse && (
                        <>
                            <span className="flex items-center gap-1">
                                <span>🕐</span> {elapsed || room.elapsed}
                            </span>
                            <div className="flex flex-col items-end gap-1">
                                <span>{endsLabel}</span>
                                <button
                                    type="button"
                                    onClick={() => setEndingRoom(room)}
                                    className="rounded border border-red-300 bg-white px-2 py-0.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                >
                                    End meeting
                                </button>
                            </div>
                        </>
                    )}
                    {room.status === RoomStatus.Open && (
                        <button
                            type="button"
                            onClick={() => setShowBookModal(true)}
                            className="w-full rounded-lg border border-green-500 bg-white py-2 text-sm font-semibold text-green-600 hover:bg-green-50"
                        >
                            Book Now
                        </button>
                    )}
                    {room.status === RoomStatus.Waiting && (
                        <>
                            <span className="flex items-center gap-1">⏳ {room.waitTime}</span>
                            <button
                                type="button"
                                onClick={() => setShowBookModal(true)}
                                className="rounded-lg border border-amber-500 bg-white px-3 py-1 text-xs font-semibold text-amber-600 hover:bg-amber-50"
                            >
                                Assign
                            </button>
                        </>
                    )}
                    {room.status === RoomStatus.Maintenance && (
                        <span className="w-full text-center text-gray-400">{room.availableIn}</span>
                    )}
                </div>
            </div>

            {showBookModal && (
                <BookRoomModal
                    room={room}
                    onClose={() => setShowBookModal(false)}
                    onConfirm={handleBook}
                />
            )}

            {endingRoom?.id === room.id && (
                <MeetingFeedbackForm
                    room={endingRoom}
                    onSubmit={(feedback) => {
                        completeMeetingEnd(endingRoom.id, feedback);
                        setEndingRoom(null);
                    }}
                />
            )}
        </>
    );
}
