"use client";

import { useMemo, useState } from "react";
import { useRooms } from "../context/RoomContext";
import { AssignRoomModal } from "./AssignRoomModal";
import { QueueFilterModal } from "./QueueFilterModal";
import {
    buildWalkInQueueRows,
    filterLabel,
    type QueueDateFilter,
} from "../lib/queueReportUtils";
import { ROOM_REQUIREMENT_ITEMS } from "./Type/WalkInFormConfig";
import type { WalkInRecord } from "./Type/VisitType";

type WalkInQueueTableProps = {
    dateFilter: QueueDateFilter;
    filterOpen: boolean;
    onFilterClose: () => void;
    onFilterApply: (filter: QueueDateFilter) => void;
};

const statusStyles: Record<WalkInRecord["status"], string> = {
    Waiting: "bg-amber-100 text-amber-700",
    "In Discussion": "bg-green-100 text-green-700",
    Assigned: "bg-blue-100 text-blue-700",
    "Meeting Done": "bg-slate-100 text-slate-700",
};

function DetailRow({
    label,
    value,
}: {
    label: string;
    value?: string | null;
}) {
    if (!value?.trim()) return null;
    return (
        <div className="flex justify-between gap-4 border-b border-gray-100 py-2">
            <dt className="shrink-0 text-gray-500">{label}</dt>
            <dd className="text-right font-medium text-gray-900">{value}</dd>
        </div>
    );
}

function statusLabel(entry: {
    status: WalkInRecord["status"];
    assignedRoomName?: string;
}): string {
    if (entry.status === "Meeting Done") {
        return "Meeting Done";
    }
    if (entry.assignedRoomName) {
        return `${entry.status} · ${entry.assignedRoomName}`;
    }
    return entry.status;
}

export function WalkInQueueTable({
    dateFilter,
    filterOpen,
    onFilterClose,
    onFilterApply,
}: WalkInQueueTableProps) {
    const { walkIns } = useRooms();
    const [detailsId, setDetailsId] = useState<string | null>(null);
    const [assignId, setAssignId] = useState<string | null>(null);

    const queueRows = useMemo(
        () => buildWalkInQueueRows(walkIns, dateFilter),
        [walkIns, dateFilter]
    );

    const selected: WalkInRecord | undefined = walkIns.find(
        (w) => w.id === detailsId
    );
    const assignTarget: WalkInRecord | undefined = walkIns.find(
        (w) => w.id === assignId
    );
    const isHistoricalView = dateFilter.preset !== "today";

    return (
        <>
            <p className="mb-3 text-xs text-gray-500">
                Showing:{" "}
                <span className="font-semibold text-blue-600">
                    {filterLabel(dateFilter)}
                </span>
                {isHistoricalView && (
                    <span className="ml-2 text-amber-600">
                        (read-only — switch to Today to assign rooms)
                    </span>
                )}
            </p>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-400">
                            <th className="pb-3 pr-4">Customer</th>
                            <th className="pb-3 pr-4">Time Arrived</th>
                            <th className="pb-3 pr-4">Type</th>
                            <th className="pb-3 pr-4">Status</th>
                            <th className="pb-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {queueRows.length === 0 && (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-8 text-center text-sm text-gray-400"
                                >
                                    No visits for this period. Try another date or
                                    month in Filter.
                                </td>
                            </tr>
                        )}
                        {queueRows.map((entry) => (
                            <tr key={entry.id} className="border-b border-gray-100">
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
                                            {entry.initials}
                                        </span>
                                        <div>
                                            <span className="font-medium text-gray-900">
                                                {entry.name}
                                            </span>
                                            <p className="text-xs text-gray-400">
                                                {entry.assignedRoomName
                                                    ? `${entry.assignedRoomName} · ${entry.interest}`
                                                    : entry.interest}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-3 pr-4 text-gray-600">
                                    {entry.arrived}
                                    {entry.waitNote && (
                                        <span className="ml-1 text-red-500">
                                            {entry.waitNote}
                                        </span>
                                    )}
                                </td>
                                <td className="py-3 pr-4 text-gray-600">{entry.type}</td>
                                <td className="py-3 pr-4">
                                    <span
                                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[entry.status]}`}
                                    >
                                        {statusLabel(entry)}
                                    </span>
                                </td>
                                <td className="py-3">
                                    {entry.action === "Assign" && !isHistoricalView ? (
                                        <button
                                            type="button"
                                            onClick={() => setAssignId(entry.id)}
                                            className="text-sm font-semibold text-blue-600 hover:underline"
                                        >
                                            Assign
                                        </button>
                                    ) : entry.action === "Details" ? (
                                        <button
                                            type="button"
                                            onClick={() => setDetailsId(entry.id)}
                                            className="text-sm font-semibold text-gray-400 hover:text-gray-600 hover:underline"
                                        >
                                            Details
                                        </button>
                                    ) : (
                                        <span className="text-sm text-gray-300">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filterOpen && (
                <QueueFilterModal
                    initialFilter={dateFilter}
                    onClose={onFilterClose}
                    onApply={onFilterApply}
                />
            )}

            {assignTarget && !isHistoricalView && (
                <AssignRoomModal
                    walkIn={assignTarget}
                    onClose={() => setAssignId(null)}
                />
            )}

            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl bg-white shadow-xl">
                        <div className="flex shrink-0 items-start justify-between border-b border-gray-200 p-5">
                            <h4 className="text-lg font-bold text-gray-900">
                                Walk-in Details
                            </h4>
                            <button
                                type="button"
                                onClick={() => setDetailsId(null)}
                                className="text-sm text-gray-500 hover:text-gray-800"
                            >
                                Close
                            </button>
                        </div>
                        <dl className="overflow-y-auto px-5 py-2 text-sm">
                            <DetailRow
                                label="Assigned room"
                                value={selected.assignedRoomName}
                            />
                            <DetailRow label="Designer" value={selected.designer} />
                            <DetailRow label="Form date" value={selected.formDate} />
                            <DetailRow label="Name" value={selected.name} />
                            <DetailRow label="Contact" value={selected.phone} />
                            <DetailRow label="Email" value={selected.email} />
                            <DetailRow
                                label="Alternate contact"
                                value={selected.alternatePhone}
                            />
                            <DetailRow
                                label="Expected move in"
                                value={selected.expectedMoveIn}
                            />
                            <DetailRow
                                label="Residing address"
                                value={selected.residingAddress}
                            />
                            <DetailRow
                                label="Property name"
                                value={selected.propertyName}
                            />
                            <DetailRow
                                label="Property address"
                                value={selected.propertyAddress}
                            />
                            <DetailRow
                                label="Property type"
                                value={selected.propertyType}
                            />
                            <DetailRow
                                label="Property use"
                                value={selected.propertyUse}
                            />
                            <DetailRow label="Budget" value={selected.budget} />
                            <DetailRow label="Possession" value={selected.possession} />
                            <DetailRow label="Requirements" value={selected.interest} />
                            {selected.isScheduled && (
                                <DetailRow
                                    label="Meeting"
                                    value={`${selected.scheduleTime ?? ""}${selected.scheduleEnd ? ` – ${selected.scheduleEnd}` : ""}`}
                                />
                            )}
                            {Object.entries(ROOM_REQUIREMENT_ITEMS).map(([room]) => {
                                const items = selected.requirements[room];
                                if (!items) return null;
                                const picked = Object.entries(items).filter(
                                    ([, v]) => v?.selected
                                );
                                if (picked.length === 0) return null;
                                return (
                                    <div
                                        key={room}
                                        className="border-t border-gray-100 py-2"
                                    >
                                        <dt className="font-semibold text-gray-700">
                                            {room}
                                        </dt>
                                        <dd className="mt-1 space-y-1 text-gray-600">
                                            {picked.map(([item, v]) => (
                                                <div key={item}>
                                                    • {item}
                                                    {v.note?.trim()
                                                        ? ` — ${v.note}`
                                                        : ""}
                                                </div>
                                            ))}
                                        </dd>
                                    </div>
                                );
                            })}
                        </dl>
                    </div>
                </div>
            )}
        </>
    );
}
