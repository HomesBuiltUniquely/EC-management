"use client";

import { useRooms } from "../context/RoomContext";
import { countByStatus, formatElapsed, formatEndsAt } from "../lib/roomUtils";
import { FloorRoom, RoomStatus } from "./Type/FloorRoomType";

const statusStyles: Record<
    RoomStatus,
    { border: string; badge: string; dot: string }
> = {
    [RoomStatus.Open]: {
        border: "border-green-200 bg-green-50/50",
        badge: "bg-green-100 text-green-700",
        dot: "text-green-600",
    },
    [RoomStatus.InUse]: {
        border: "border-red-200 bg-red-50/50",
        badge: "bg-red-100 text-red-700",
        dot: "text-red-600",
    },
    [RoomStatus.Waiting]: {
        border: "border-amber-200 bg-amber-50/50",
        badge: "bg-amber-100 text-amber-700",
        dot: "text-amber-600",
    },
    [RoomStatus.Maintenance]: {
        border: "border-gray-200 bg-gray-50",
        badge: "bg-gray-200 text-gray-600",
        dot: "text-gray-500",
    },
};

function availabilityLabel(status: RoomStatus): string {
    switch (status) {
        case RoomStatus.Open:
            return "Available now";
        case RoomStatus.InUse:
            return "Occupied";
        case RoomStatus.Waiting:
            return "Reserved — waiting";
        case RoomStatus.Maintenance:
            return "Unavailable";
    }
}

function RoomDetailCard({ room }: { room: FloorRoom }) {
    const styles = statusStyles[room.status];

    return (
        <div
            className={`rounded-xl border p-4 ${styles.border}`}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h4 className="font-bold text-gray-900">{room.name}</h4>
                    <p className="mt-0.5 text-xs text-gray-500">
                        {availabilityLabel(room.status)}
                    </p>
                </div>
                <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${styles.badge}`}
                >
                    <span className={styles.dot}>● </span>
                    {room.status}
                </span>
            </div>

            {room.status === RoomStatus.InUse && (
                <dl className="mt-3 space-y-1 border-t border-red-100 pt-3 text-sm">
                    <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Client</dt>
                        <dd className="font-medium text-gray-900">
                            {room.leadName ?? "—"}
                        </dd>
                    </div>
                    {room.withName && (
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Designer</dt>
                            <dd className="font-medium text-gray-900">
                                {room.withName}
                            </dd>
                        </div>
                    )}
                    {room.bookedAt && (
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Duration</dt>
                            <dd className="text-gray-700">
                                {formatElapsed(room.bookedAt)}
                            </dd>
                        </div>
                    )}
                    {room.endT && (
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Ends</dt>
                            <dd className="text-gray-700">
                                {formatEndsAt(room.endT)}
                            </dd>
                        </div>
                    )}
                </dl>
            )}

            {room.status === RoomStatus.Waiting && (
                <dl className="mt-3 space-y-1 border-t border-amber-100 pt-3 text-sm">
                    <div className="flex justify-between gap-2">
                        <dt className="text-gray-500">Guest</dt>
                        <dd className="font-medium text-gray-900">
                            {room.leadName ?? "—"}
                        </dd>
                    </div>
                    {room.subtitle && (
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Note</dt>
                            <dd className="text-gray-700">{room.subtitle}</dd>
                        </div>
                    )}
                    {room.waitTime && (
                        <div className="flex justify-between gap-2">
                            <dt className="text-gray-500">Wait</dt>
                            <dd className="text-amber-700">{room.waitTime}</dd>
                        </div>
                    )}
                </dl>
            )}

            {room.status === RoomStatus.Maintenance && room.availableIn && (
                <p className="mt-3 border-t border-gray-200 pt-3 text-sm text-gray-500">
                    {room.availableIn}
                </p>
            )}

            {room.status === RoomStatus.Open && (
                <p className="mt-3 border-t border-green-100 pt-3 text-sm font-medium text-green-700">
                    Ready to book — use EC Floor View or Book Now on the card.
                </p>
            )}
        </div>
    );
}

type RoomsDetailsModalProps = {
    onClose: () => void;
};

export function RoomsDetailsModal({ onClose }: RoomsDetailsModalProps) {
    const { rooms, stats } = useRooms();

    const available = countByStatus(rooms, RoomStatus.Open);
    const occupied = countByStatus(rooms, RoomStatus.InUse);
    const reserved = countByStatus(rooms, RoomStatus.Waiting);
    const maintenance = countByStatus(rooms, RoomStatus.Maintenance);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-10 backdrop-blur-sm">
            <div className="mb-8 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="shrink-0 border-b border-blue-100 bg-blue-600 px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">Rooms</h2>
                            <p className="mt-1 text-sm text-blue-100">
                                Live availability across all experience centre rooms
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-white/30 px-3 py-1 text-sm text-white hover:bg-white/10"
                        >
                            Close
                        </button>
                    </div>
                </div>

                <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                            <p className="text-2xl font-bold text-green-700">
                                {available}
                            </p>
                            <p className="text-xs font-semibold text-green-600">
                                Available
                            </p>
                        </div>
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                            <p className="text-2xl font-bold text-red-700">
                                {occupied}
                            </p>
                            <p className="text-xs font-semibold text-red-600">
                                In use
                            </p>
                        </div>
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-center">
                            <p className="text-2xl font-bold text-amber-700">
                                {reserved}
                            </p>
                            <p className="text-xs font-semibold text-amber-600">
                                Waiting
                            </p>
                        </div>
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center">
                            <p className="text-2xl font-bold text-gray-600">
                                {maintenance}
                            </p>
                            <p className="text-xs font-semibold text-gray-500">
                                Maintenance
                            </p>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-800">
                            {stats.open} of {stats.total} rooms
                        </span>{" "}
                        are available right now. Book from the dashboard floor view when
                        a room shows{" "}
                        <span className="font-medium text-green-600">OPEN</span>.
                    </p>

                    <div className="space-y-3">
                        {rooms.map((room) => (
                            <RoomDetailCard key={room.id} room={room} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
