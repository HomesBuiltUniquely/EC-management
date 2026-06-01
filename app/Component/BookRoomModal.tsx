"use client";

import { useEffect, useState } from "react";
import { FloorRoom, RoomBookingInput, RoomStatus } from "./Type/FloorRoomType";

type BookRoomModalProps = {
    room: FloorRoom | null;
    onClose: () => void;
    onConfirm: (booking: RoomBookingInput, scheduleOnly: boolean) => void;
};

function defaultStartTime(): string {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function defaultEndTime(): string {
    const end = new Date();
    end.setHours(end.getHours() + 1);
    const h = end.getHours();
    const m = end.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function BookRoomModal({ room, onClose, onConfirm }: BookRoomModalProps) {
    const [leadName, setLeadName] = useState("");
    const [withName, setWithName] = useState("");
    const [startT, setStartT] = useState(defaultStartTime);
    const [endT, setEndT] = useState(defaultEndTime);
    const [scheduleOnly, setScheduleOnly] = useState(false);
    const [error, setError] = useState("");

    const isWaiting = room?.status === RoomStatus.Waiting;
    const isOpen = room?.status === RoomStatus.Open;

    useEffect(() => {
        if (room) {
            setLeadName(room.leadName ?? "");
            setWithName(room.withName ?? "");
            setStartT(defaultStartTime());
            setEndT(defaultEndTime());
            setScheduleOnly(false);
            setError("");
        }
    }, [room]);

    if (!room) return null;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!leadName.trim()) {
            setError("Lead name is required.");
            return;
        }
        if (!endT.trim()) {
            setError("End time is required.");
            return;
        }
        onConfirm(
            {
                leadName: leadName.trim(),
                withName: withName.trim() || undefined,
                startT,
                endT: endT.trim(),
            },
            scheduleOnly && isOpen
        );
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {isWaiting ? "Assign Room" : scheduleOnly ? "Schedule Meeting" : "Book Room"}
                        </h3>
                        <p className="text-sm text-gray-500">{room.name}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-3 py-1 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Close
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                    )}

                    {isOpen && (
                        <div className="flex gap-2 rounded-lg bg-gray-50 p-1">
                            <button
                                type="button"
                                onClick={() => setScheduleOnly(false)}
                                className={`flex-1 rounded-md py-2 text-sm font-semibold ${!scheduleOnly ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                            >
                                Start now
                            </button>
                            <button
                                type="button"
                                onClick={() => setScheduleOnly(true)}
                                className={`flex-1 rounded-md py-2 text-sm font-semibold ${scheduleOnly ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"}`}
                            >
                                Schedule today
                            </button>
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                            Lead / Customer name *
                        </label>
                        <input
                            required
                            value={leadName}
                            onChange={(e) => setLeadName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="e.g. Sarah Jenkins"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-semibold text-gray-700">
                            With (optional)
                        </label>
                        <input
                            value={withName}
                            onChange={(e) => setWithName(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            placeholder="e.g. Rahul Kumar"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                                Start time
                            </label>
                            <input
                                type="time"
                                value={startT}
                                onChange={(e) => setStartT(e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-gray-700">
                                End time *
                            </label>
                            <input
                                value={endT}
                                onChange={(e) => setEndT(e.target.value)}
                                placeholder="e.g. 11:15 AM"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        {isWaiting
                            ? "Assign & start meeting"
                            : scheduleOnly
                              ? "Add to today's schedule"
                              : "Confirm booking"}
                    </button>
                </form>
            </div>
        </div>
    );
}
