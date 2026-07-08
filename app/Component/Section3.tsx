"use client";

import { useState, type ReactNode } from "react";
import { useRooms } from "../context/RoomContext";
import { CurrentMeetings } from "./CurrentMeetings";
import { quickActions } from "./Type/DashboardType";
import { WalkInQueueTable } from "./WalkInQueueTable";
import type { QueueDateFilter } from "../lib/queueReportUtils";

function SectionShell({
    title,
    icon,
    action,
    children,
    className = "",
}: {
    title: string;
    icon: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`rounded-xl border border-dashed border-gray-300 bg-white p-5 ${className}`}>
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="font-bold text-gray-900">{title}</h3>
                </div>
                {action}
            </div>
            {children}
        </div>
    );
}

export function Section3() {
    const { stats, visitStats } = useRooms();
    const [dateFilter, setDateFilter] = useState<QueueDateFilter>({
        preset: "today",
    });
    const [filterOpen, setFilterOpen] = useState(false);

    return (
        <section className="mx-auto mt-10 max-w-7xl px-8 pb-12">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Meeting Queue — 2/3 width */}
                <SectionShell
                    className="lg:col-span-2"
                    title="Meeting Queue"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                    }
                    action={
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => setFilterOpen(true)}
                                className={`rounded-lg border px-3 py-1.5 text-sm font-medium hover:bg-gray-50 ${
                                    dateFilter.preset !== "today"
                                        ? "border-blue-400 bg-blue-50 text-blue-700"
                                        : "border-gray-300 text-gray-600"
                                }`}
                            >
                                Filter
                            </button>
                            <button type="button" className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
                                Assign Designer
                            </button>
                        </div>
                    }
                >
                    <WalkInQueueTable
                        dateFilter={dateFilter}
                        filterOpen={filterOpen}
                        onFilterClose={() => setFilterOpen(false)}
                        onFilterApply={(filter) => {
                            setDateFilter(filter);
                            setFilterOpen(false);
                        }}
                    />
                    <p className="mt-4 text-center text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                        View All Queue
                    </p>
                </SectionShell>

                {/* Current Meetings — 1/3 width */}
                <SectionShell
                    title="Current Meetings"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                        </svg>
                    }
                    action={
                        <button type="button" className="text-sm font-medium text-blue-600 hover:underline">
                            View Flow
                        </button>
                    }
                >
                    <CurrentMeetings />
                </SectionShell>

                {/* Quick Actions */}
                <SectionShell
                    title="Quick Actions"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                        </svg>
                    }
                >
                    <div className="grid grid-cols-2 gap-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                type="button"
                                className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 hover:bg-gray-50"
                            >
                                <span className={`flex h-10 w-10 items-center justify-center rounded-full ${action.iconBg} ${action.iconColor} text-lg`}>
                                    +
                                </span>
                                <span className="text-sm font-medium text-gray-700">{action.label}</span>
                            </button>
                        ))}
                    </div>
                </SectionShell>

                {/* EC Summary Metrics */}
                <SectionShell
                    className="lg:col-span-2"
                    title="EC Summary Metrics"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                        </svg>
                    }
                >
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Conversion Rate</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                24% <span className="text-sm font-semibold text-green-600">↑ 2%</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Active Meetings</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">
                                {visitStats.meetingsDoneToday}{" "}
                                <span className="text-sm font-normal text-gray-500">done today</span>
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Avg. Duration</p>
                            <p className="mt-1 text-3xl font-bold text-gray-900">52m</p>
                            <p className="text-xs text-gray-400">Target: 45m</p>
                        </div>
                    </div>
                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-gray-200 pt-6 sm:grid-cols-2">
                        <div className="flex items-center gap-3">
                            <span className="text-red-500">📅</span>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">No-Shows</p>
                                <p className="text-sm text-gray-500">2 Today</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-blue-500">🕐</span>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">Next Free Slot</p>
                                <p className="text-sm text-gray-500">
                                    {stats.open > 0
                                        ? `${stats.open} room${stats.open > 1 ? "s" : ""} available now`
                                        : "All rooms occupied"}
                                </p>
                            </div>
                        </div>
                    </div>
                </SectionShell>
            </div>
        </section>
    );
}
