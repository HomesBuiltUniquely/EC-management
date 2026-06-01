"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    FloorRoom,
    getDefaultFloorRooms,
    RoomBookingInput,
    RoomStatus,
} from "../Component/Type/FloorRoomType";
import {
    MeetingFeedbackInput,
    MeetingFeedbackRecord,
} from "../Component/Type/FeedbackType";
import {
    CompletedMeeting,
    ScheduledMeeting,
    WalkInFormInput,
    WalkInQueueRow,
    WalkInRecord,
} from "../Component/Type/VisitType";
import {
    getSelectedRequirementsSummary,
    normalizeRequirements,
} from "../Component/Type/WalkInFormConfig";
import { formatTimeArrived, formatWaitNote, getTodayKey } from "../lib/dateUtils";
import { getInitials, toOpenRoom } from "../lib/roomUtils";

type VisitStats = {
    walkInsToday: number;
    scheduledToday: number;
    scheduledConfirmed: number;
    meetingsDoneToday: number;
    ongoingMeetings: number;
    totalRooms: number;
};

function normalizeWalkIn(raw: WalkInRecord): WalkInRecord {
    const requirements = normalizeRequirements(
        raw.requirements as WalkInRecord["requirements"]
    );
    return {
        ...raw,
        designer: raw.designer ?? "Staff",
        formDate: raw.formDate ?? raw.dateKey ?? getTodayKey(),
        alternatePhone: raw.alternatePhone ?? "",
        expectedMoveIn: raw.expectedMoveIn ?? "",
        residingAddress:
            raw.residingAddress ?? raw.address ?? "",
        propertyName: raw.propertyName ?? "",
        propertyAddress: raw.propertyAddress ?? "",
        propertyType: raw.propertyType ?? "",
        propertyUse: raw.propertyUse ?? "",
        budget: raw.budget ?? "—",
        possession: raw.possession ?? "",
        requirements,
        interest:
            raw.interest ??
            getSelectedRequirementsSummary(requirements),
        isScheduled: raw.isScheduled ?? Boolean(raw.scheduleTime),
        leadSources: raw.leadSources ?? [],
    };
}

type RoomContextValue = {
    staffName: string;
    rooms: FloorRoom[];
    walkIns: WalkInRecord[];
    bookRoom: (roomId: number, booking: RoomBookingInput, scheduleOnly?: boolean) => boolean;
    completeMeetingEnd: (
        roomId: number,
        feedback: MeetingFeedbackInput
    ) => boolean;
    setWaiting: (roomId: number, leadName: string, subtitle?: string) => void;
    addWalkIn: (input: WalkInFormInput) => void;
    assignWalkInToRoom: (
        walkInId: string,
        roomId: number,
        mode: "start" | "wait"
    ) => boolean;
    updateWalkInStatus: (
        id: string,
        status: WalkInRecord["status"]
    ) => void;
    stats: {
        total: number;
        open: number;
        inUse: number;
        waiting: number;
        maintenance: number;
    };
    visitStats: VisitStats;
    inUseRooms: FloorRoom[];
    walkInQueue: WalkInQueueRow[];
    completed: CompletedMeeting[];
    feedbacks: MeetingFeedbackRecord[];
    scheduled: ScheduledMeeting[];
};

const RoomContext = createContext<RoomContextValue | null>(null);

function uid(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function RoomProvider({
    children,
    bookedBy = "Staff",
}: {
    children: React.ReactNode;
    bookedBy?: string;
}) {
    const [rooms, setRooms] = useState<FloorRoom[]>(getDefaultFloorRooms);
    const [walkIns, setWalkIns] = useState<WalkInRecord[]>([]);
    const [scheduled, setScheduled] = useState<ScheduledMeeting[]>([]);
    const [completed, setCompleted] = useState<CompletedMeeting[]>([]);
    const [feedbacks, setFeedbacks] = useState<MeetingFeedbackRecord[]>([]);
    const [hydrated, setHydrated] = useState(false);
    const [dbError, setDbError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const today = getTodayKey();

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const res = await fetch("/api/dashboard");
                const data = await res.json();
                if (!res.ok) {
                    if (!cancelled) {
                        setDbError(
                            data.error ??
                                "Failed to load dashboard from database."
                        );
                        setHydrated(true);
                    }
                    return;
                }
                if (cancelled) return;
                setRooms(data.rooms ?? getDefaultFloorRooms());
                setWalkIns((data.walkIns ?? []).map(normalizeWalkIn));
                setScheduled(data.scheduled ?? []);
                setCompleted(data.completed ?? []);
                setFeedbacks(data.feedbacks ?? []);
                setDbError(null);
            } catch {
                if (!cancelled) {
                    setDbError(
                        "Cannot reach the server. Check MySQL and restart the app."
                    );
                }
            } finally {
                if (!cancelled) setHydrated(true);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (!hydrated || dbError) return;

        const payload = { rooms, walkIns, scheduled, completed, feedbacks };
        const timer = setTimeout(async () => {
            setSaving(true);
            try {
                const res = await fetch("/api/dashboard", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                const data = await res.json();
                if (!res.ok) {
                    setDbError(data.error ?? "Failed to save to database.");
                } else {
                    setDbError(null);
                }
            } catch {
                setDbError("Failed to save dashboard to database.");
            } finally {
                setSaving(false);
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [rooms, walkIns, scheduled, completed, feedbacks, hydrated, dbError]);

    const addWalkIn = useCallback((input: WalkInFormInput) => {
        const now = Date.now();
        const dateKey = getTodayKey();
        const hasSchedule = Boolean(input.scheduleTime?.trim());
        const walkInId = uid();

        const requirements = normalizeRequirements(input.requirements);
        const record: WalkInRecord = {
            id: walkInId,
            designer: input.designer.trim(),
            formDate: input.formDate,
            name: input.name.trim(),
            email: input.email.trim(),
            phone: input.phone.trim(),
            alternatePhone: input.alternatePhone?.trim(),
            expectedMoveIn: input.expectedMoveIn?.trim(),
            residingAddress: input.residingAddress?.trim(),
            propertyName: input.propertyName?.trim(),
            propertyAddress: input.propertyAddress?.trim(),
            propertyType: input.propertyType,
            propertyUse: input.propertyUse,
            budget: input.budget.trim(),
            possession: input.possession?.trim(),
            requirements,
            interest: getSelectedRequirementsSummary(requirements),
            arrivedAt: now,
            dateKey,
            status: "Waiting",
            isScheduled: hasSchedule,
            scheduleTime: input.scheduleTime?.trim(),
            scheduleEnd: input.scheduleEnd?.trim(),
        };

        setWalkIns((prev) => [...prev, record]);

        if (hasSchedule) {
            const meeting: ScheduledMeeting = {
                id: uid(),
                leadName: input.name.trim(),
                startT: input.scheduleTime!.trim(),
                endT: input.scheduleEnd?.trim() || "TBD",
                scheduledAt: now,
                dateKey,
                confirmed: true,
                walkInId,
            };
            setScheduled((prev) => [...prev, meeting]);
        }
    }, []);

    const updateWalkInStatus = useCallback(
        (id: string, status: WalkInRecord["status"]) => {
            setWalkIns((prev) =>
                prev.map((w) => (w.id === id ? { ...w, status } : w))
            );
        },
        []
    );

    const assignWalkInToRoom = useCallback(
        (walkInId: string, roomId: number, mode: "start" | "wait"): boolean => {
            const walkIn = walkIns.find((w) => w.id === walkInId);
            const room = rooms.find((r) => r.id === roomId);
            if (!walkIn || !room || walkIn.status === "Meeting Done") return false;

            const now = new Date();
            const startT =
                walkIn.scheduleTime?.trim() ||
                `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            const endT = walkIn.scheduleEnd?.trim() || "TBD";

            if (mode === "start") {
                if (
                    room.status !== RoomStatus.Open &&
                    room.status !== RoomStatus.Waiting
                ) {
                    return false;
                }

                setRooms((prev) =>
                    prev.map((r) => {
                        if (r.id !== roomId) return r;
                        return {
                            id: r.id,
                            name: r.name,
                            status: RoomStatus.InUse,
                            leadName: walkIn.name,
                            withName: walkIn.designer,
                            initials: getInitials(walkIn.name),
                            bookedAt: Date.now(),
                            startT,
                            endT,
                            bookedBy,
                        };
                    })
                );

                setWalkIns((prev) =>
                    prev.map((w) =>
                        w.id === walkInId
                            ? {
                                  ...w,
                                  status: "In Discussion",
                                  assignedRoomId: roomId,
                                  assignedRoomName: room.name,
                              }
                            : w
                    )
                );
                return true;
            }

            if (room.status !== RoomStatus.Open) return false;

            setRooms((prev) =>
                prev.map((r) => {
                    if (r.id !== roomId) return r;
                    return {
                        id: r.id,
                        name: r.name,
                        status: RoomStatus.Waiting,
                        leadName: walkIn.name,
                        initials: getInitials(walkIn.name),
                        subtitle: "Waiting for Designer",
                        waitTime: "Just now",
                    };
                })
            );

            setWalkIns((prev) =>
                prev.map((w) =>
                    w.id === walkInId
                        ? {
                              ...w,
                              status: "Assigned",
                              assignedRoomId: roomId,
                              assignedRoomName: room.name,
                          }
                        : w
                )
            );
            return true;
        },
        [walkIns, rooms, bookedBy]
    );

    const bookRoom = useCallback(
        (
            roomId: number,
            booking: RoomBookingInput,
            scheduleOnly = false
        ): boolean => {
            if (scheduleOnly) {
                const target = rooms.find((r) => r.id === roomId);
                if (!target || target.status !== RoomStatus.Open) return false;
                setScheduled((prev) => [
                    ...prev,
                    {
                        id: uid(),
                        leadName: booking.leadName.trim(),
                        withName: booking.withName?.trim(),
                        roomName: target.name,
                        startT: booking.startT,
                        endT: booking.endT,
                        scheduledAt: Date.now(),
                        dateKey: getTodayKey(),
                        confirmed: true,
                    },
                ]);
                return true;
            }

            let booked = false;
            setRooms((prev) => {
                const room = prev.find((r) => r.id === roomId);
                if (
                    !room ||
                    (room.status !== RoomStatus.Open &&
                        room.status !== RoomStatus.Waiting)
                ) {
                    return prev;
                }
                booked = true;
                return prev.map((r) => {
                    if (r.id !== roomId) return r;
                    return {
                        id: r.id,
                        name: r.name,
                        status: RoomStatus.InUse,
                        leadName: booking.leadName.trim(),
                        withName: booking.withName?.trim() || undefined,
                        initials: getInitials(booking.leadName),
                        bookedAt: Date.now(),
                        startT: booking.startT,
                        endT: booking.endT,
                        bookedBy,
                    };
                });
            });
            return booked;
        },
        [rooms, bookedBy]
    );

    const completeMeetingEnd = useCallback(
        (roomId: number, feedback: MeetingFeedbackInput): boolean => {
            const room = rooms.find((r) => r.id === roomId);
            if (!room || room.status !== RoomStatus.InUse) return false;

            const completedAt = Date.now();
            const dateKey = getTodayKey();

            const done: CompletedMeeting = {
                id: uid(),
                roomName: room.name,
                leadName: room.leadName ?? "Guest",
                withName: room.withName,
                completedAt,
                dateKey,
            };

            const feedbackRecord: MeetingFeedbackRecord = {
                ...feedback,
                id: uid(),
                roomId,
                roomName: room.name,
                leadName: room.leadName ?? "Guest",
                completedAt,
                dateKey,
            };

            setCompleted((c) => [...c, done]);
            setFeedbacks((f) => [...f, feedbackRecord]);

            setWalkIns((prev) =>
                prev.map((w) => {
                    const linkedToRoom =
                        w.assignedRoomId === roomId ||
                        (room.leadName &&
                            w.name.trim().toLowerCase() ===
                                room.leadName.trim().toLowerCase() &&
                            (w.status === "In Discussion" ||
                                w.status === "Assigned"));
                    if (!linkedToRoom) return w;
                    return { ...w, status: "Meeting Done" as const };
                })
            );

            setRooms((prev) =>
                prev.map((r) => (r.id === roomId ? toOpenRoom(r) : r))
            );

            return true;
        },
        [rooms]
    );

    const setWaiting = useCallback(
        (roomId: number, leadName: string, subtitle = "Waiting for Designer") => {
            setRooms((prev) =>
                prev.map((room) => {
                    if (room.id !== roomId || room.status !== RoomStatus.Open) {
                        return room;
                    }
                    return {
                        id: room.id,
                        name: room.name,
                        status: RoomStatus.Waiting,
                        leadName: leadName.trim(),
                        initials: getInitials(leadName),
                        subtitle,
                        waitTime: "Just now",
                    };
                })
            );
        },
        []
    );

    const stats = useMemo(
        () => ({
            total: rooms.length,
            open: rooms.filter((r) => r.status === RoomStatus.Open).length,
            inUse: rooms.filter((r) => r.status === RoomStatus.InUse).length,
            waiting: rooms.filter((r) => r.status === RoomStatus.Waiting).length,
            maintenance: rooms.filter((r) => r.status === RoomStatus.Maintenance).length,
        }),
        [rooms]
    );

    const visitStats = useMemo((): VisitStats => {
        const walkInsToday = walkIns.filter((w) => w.dateKey === today).length;
        const scheduledTodayList = scheduled.filter((s) => s.dateKey === today);
        const waitingToday = rooms.filter((r) => r.status === RoomStatus.Waiting).length;
        const scheduledToday =
            scheduledTodayList.length + waitingToday;
        const scheduledConfirmed = scheduledTodayList.filter((s) => s.confirmed).length;
        const meetingsDoneToday = completed.filter((c) => c.dateKey === today).length;

        return {
            walkInsToday,
            scheduledToday,
            scheduledConfirmed,
            meetingsDoneToday,
            ongoingMeetings: stats.inUse,
            totalRooms: stats.total,
        };
    }, [walkIns, scheduled, completed, rooms, today, stats.inUse, stats.total]);

    const walkInQueue = useMemo((): WalkInQueueRow[] => {
        return walkIns
            .filter((w) => w.dateKey === today)
            .map((w) => ({
                id: w.id,
                initials: getInitials(w.name),
                name: w.name,
                email: w.email,
                phone: w.phone,
                interest: w.interest,
                arrived: formatTimeArrived(w.arrivedAt),
                waitNote:
                    w.status === "Meeting Done"
                        ? undefined
                        : formatWaitNote(w.arrivedAt),
                type: w.isScheduled ? "Scheduled" : "Walk-in",
                status: w.status,
                assignedRoomName: w.assignedRoomName,
                action:
                    w.status === "Meeting Done"
                        ? ""
                        : w.status === "Waiting" ||
                            (w.status === "Assigned" && !w.assignedRoomId)
                          ? "Assign"
                          : w.status === "In Discussion"
                            ? ""
                            : "Details",
            }))
            .reverse();
    }, [walkIns, today]);

    const inUseRooms = useMemo(
        () => rooms.filter((r) => r.status === RoomStatus.InUse),
        [rooms]
    );

    return (
        <>
            {dbError && (
                <div className="border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-700">
                    {dbError}
                </div>
            )}
            {saving && !dbError && (
                <div className="border-b border-blue-100 bg-blue-50 px-4 py-1 text-center text-xs text-blue-600">
                    Saving to database…
                </div>
            )}
            <RoomContext.Provider
            value={{
                staffName: bookedBy,
                rooms,
                walkIns,
                bookRoom,
                completeMeetingEnd,
                setWaiting,
                addWalkIn,
                assignWalkInToRoom,
                updateWalkInStatus,
                stats,
                visitStats,
                inUseRooms,
                walkInQueue,
                completed,
                feedbacks,
                scheduled,
            }}
        >
            {children}
        </RoomContext.Provider>
        </>
    );
}

export function useRooms() {
    const ctx = useContext(RoomContext);
    if (!ctx) {
        throw new Error("useRooms must be used within RoomProvider");
    }
    return ctx;
}
