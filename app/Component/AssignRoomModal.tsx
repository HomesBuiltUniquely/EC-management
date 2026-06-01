"use client";

import { useState } from "react";
import { useRooms } from "../context/RoomContext";
import { RoomStatus } from "./Type/FloorRoomType";
import type { WalkInRecord } from "./Type/VisitType";

type AssignRoomModalProps = {
    walkIn: WalkInRecord;
    onClose: () => void;
};

export function AssignRoomModal({ walkIn, onClose }: AssignRoomModalProps) {
    const { rooms, assignWalkInToRoom } = useRooms();
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [mode, setMode] = useState<"start" | "wait">("start");
    const [error, setError] = useState("");

    const openRooms = rooms.filter((r) => r.status === RoomStatus.Open);
    const waitingRooms = rooms.filter((r) => r.status === RoomStatus.Waiting);

    function handleConfirm() {
        if (selectedRoomId === null) {
            setError("Please select a room.");
            return;
        }
        const ok = assignWalkInToRoom(walkIn.id, selectedRoomId, mode);
        if (!ok) {
            setError("Could not assign — room may no longer be available.");
            return;
        }
        onClose();
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="border-b border-gray-200 px-6 py-4">
                    <h3 className="text-lg font-bold text-gray-900">Assign to Room</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {walkIn.name} · {walkIn.interest}
                    </p>
                </div>

                <div className="space-y-4 px-6 py-4">
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    {openRooms.length === 0 && waitingRooms.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No rooms available right now. All rooms are occupied or
                            under maintenance.
                        </p>
                    ) : (
                        <>
                            <div>
                                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                                    Available rooms
                                </p>
                                <div className="space-y-2">
                                    {openRooms.map((room) => (
                                        <label
                                            key={room.id}
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                                selectedRoomId === room.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="room"
                                                checked={selectedRoomId === room.id}
                                                onChange={() => {
                                                    setSelectedRoomId(room.id);
                                                    setError("");
                                                }}
                                                className="accent-blue-600"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {room.name}
                                                </p>
                                                <p className="text-xs text-green-600">
                                                    Open — ready
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                    {waitingRooms.map((room) => (
                                        <label
                                            key={room.id}
                                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${
                                                selectedRoomId === room.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-blue-300"
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="room"
                                                checked={selectedRoomId === room.id}
                                                onChange={() => {
                                                    setSelectedRoomId(room.id);
                                                    setMode("start");
                                                    setError("");
                                                }}
                                                className="accent-blue-600"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {room.name}
                                                </p>
                                                <p className="text-xs text-amber-600">
                                                    Waiting — {room.leadName}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {selectedRoomId !== null &&
                                openRooms.some((r) => r.id === selectedRoomId) && (
                                    <div className="flex gap-2 rounded-lg bg-gray-50 p-1">
                                        <button
                                            type="button"
                                            onClick={() => setMode("start")}
                                            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
                                                mode === "start"
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            Start meeting now
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMode("wait")}
                                            className={`flex-1 rounded-md py-2 text-sm font-semibold ${
                                                mode === "wait"
                                                    ? "bg-white text-blue-600 shadow-sm"
                                                    : "text-gray-500"
                                            }`}
                                        >
                                            Waiting in room
                                        </button>
                                    </div>
                                )}
                        </>
                    )}
                </div>

                <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={openRooms.length === 0 && waitingRooms.length === 0}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        Confirm assignment
                    </button>
                </div>
            </div>
        </div>
    );
}
