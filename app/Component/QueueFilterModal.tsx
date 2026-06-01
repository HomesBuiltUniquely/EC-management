"use client";

import { useMemo, useState } from "react";
import { useRooms } from "../context/RoomContext";
import {
    buildQueuePeriodReport,
    filterLabel,
    type QueueDateFilter,
} from "../lib/queueReportUtils";
import {
    getCurrentMonthKey,
    getTodayKey,
    getYesterdayKey,
} from "../lib/dateUtils";
import type { WalkInRecord } from "./Type/VisitType";

const inputClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type QueueFilterModalProps = {
    initialFilter: QueueDateFilter;
    onClose: () => void;
    onApply: (filter: QueueDateFilter) => void;
};

function StatCard({
    label,
    value,
    sub,
}: {
    label: string;
    value: number | string;
    sub?: string;
}) {
    return (
        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                {label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
        </div>
    );
}

function ChipList({ title, items }: { title: string; items: string[] }) {
    return (
        <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                {title} ({items.length})
            </p>
            {items.length === 0 ? (
                <p className="text-sm text-gray-400">None recorded for this period.</p>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                        <span
                            key={item}
                            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

const statusStyles: Record<WalkInRecord["status"], string> = {
    Waiting: "bg-amber-100 text-amber-700",
    "In Discussion": "bg-green-100 text-green-700",
    Assigned: "bg-blue-100 text-blue-700",
    "Meeting Done": "bg-slate-100 text-slate-700",
};

export function QueueFilterModal({
    initialFilter,
    onClose,
    onApply,
}: QueueFilterModalProps) {
    const { walkIns, completed, feedbacks, scheduled } = useRooms();
    const [preset, setPreset] = useState<QueueDateFilter["preset"]>(
        initialFilter.preset
    );
    const [customDate, setCustomDate] = useState(
        initialFilter.preset === "day" ? initialFilter.date : getTodayKey()
    );
    const [customMonth, setCustomMonth] = useState(
        initialFilter.preset === "month"
            ? initialFilter.month
            : getCurrentMonthKey()
    );

    const draftFilter = useMemo((): QueueDateFilter => {
        if (preset === "today") return { preset: "today" };
        if (preset === "yesterday") return { preset: "yesterday" };
        if (preset === "month") return { preset: "month", month: customMonth };
        return { preset: "day", date: customDate };
    }, [preset, customDate, customMonth]);

    const report = useMemo(
        () =>
            buildQueuePeriodReport(draftFilter, {
                walkIns,
                completed,
                feedbacks,
                scheduled,
            }),
        [draftFilter, walkIns, completed, feedbacks, scheduled]
    );

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
            <div className="mb-8 flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="shrink-0 border-b border-blue-100 bg-blue-600 px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Queue &amp; Visit Report
                            </h2>
                            <p className="mt-1 text-sm text-blue-100">
                                {report.periodLabel}
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

                <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
                    <div>
                        <p className="mb-3 text-sm font-semibold text-gray-800">
                            Date range
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    ["today", "Today"],
                                    ["yesterday", "Yesterday"],
                                    ["day", "Pick a day"],
                                    ["month", "Entire month"],
                                ] as const
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setPreset(key)}
                                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                                        preset === key
                                            ? "border-blue-500 bg-blue-50 text-blue-700"
                                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        {preset === "day" && (
                            <div className="mt-3 max-w-xs">
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Select date
                                </label>
                                <input
                                    type="date"
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        )}
                        {preset === "month" && (
                            <div className="mt-3 max-w-xs">
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Select month
                                </label>
                                <input
                                    type="month"
                                    value={customMonth}
                                    onChange={(e) => setCustomMonth(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        <StatCard
                            label="Meetings done"
                            value={report.meetingsCompleted}
                        />
                        <StatCard
                            label="Walk-in clients"
                            value={report.walkInsTotal}
                            sub={`${report.walkInsWalkIn} walk-in · ${report.walkInsScheduled} scheduled`}
                        />
                        <StatCard
                            label="Scheduled slots"
                            value={report.scheduledSlots}
                        />
                        <StatCard
                            label="Unique clients"
                            value={report.clients.length}
                        />
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        <ChipList title="Clients" items={report.clients} />
                        <ChipList title="Designers" items={report.designers} />
                        <ChipList title="Sales" items={report.salesReps} />
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-semibold text-gray-800">
                            Meetings completed ({report.meetings.length})
                        </p>
                        {report.meetings.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                                No completed meetings for this period.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                                        <tr>
                                            <th className="px-3 py-2">Client</th>
                                            <th className="px-3 py-2">Room</th>
                                            <th className="px-3 py-2">Designer</th>
                                            <th className="px-3 py-2">Sales</th>
                                            <th className="px-3 py-2">Ended</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.meetings.map((m) => (
                                            <tr
                                                key={m.id}
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-3 py-2 font-medium text-gray-900">
                                                    {m.client}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {m.room}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {m.designer || "—"}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {m.salesRep || "—"}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {m.time}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div>
                        <p className="mb-3 text-sm font-semibold text-gray-800">
                            All visits in period ({report.walkIns.length})
                        </p>
                        {report.walkIns.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                                No walk-ins or scheduled visits for this period.
                            </p>
                        ) : (
                            <div className="overflow-x-auto rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                                        <tr>
                                            <th className="px-3 py-2">Customer</th>
                                            <th className="px-3 py-2">Designer</th>
                                            <th className="px-3 py-2">Type</th>
                                            <th className="px-3 py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {report.walkIns.map((w) => (
                                            <tr
                                                key={w.id}
                                                className="border-t border-gray-100"
                                            >
                                                <td className="px-3 py-2 font-medium text-gray-900">
                                                    {w.name}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {w.designer}
                                                </td>
                                                <td className="px-3 py-2 text-gray-600">
                                                    {w.isScheduled
                                                        ? "Scheduled"
                                                        : "Walk-in"}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <span
                                                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusStyles[w.status]}`}
                                                    >
                                                        {w.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 justify-end gap-2 border-t border-gray-200 bg-gray-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-white"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onApply(draftFilter)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                    >
                        Apply filter · {filterLabel(draftFilter)}
                    </button>
                </div>
            </div>
        </div>
    );
}
