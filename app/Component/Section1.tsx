"use client";

import { useRooms } from "../context/RoomContext";

export function Section1() {
    const { visitStats } = useRooms();

    const pad = (n: number) => String(n).padStart(2, "0");

    const visitStatsCards = [
        {
            label: "Walk-ins",
            value: pad(visitStats.walkInsToday),
            sub:
                visitStats.walkInsToday > 0
                    ? "today"
                    : "submit walk-in form",
            subColor: visitStats.walkInsToday > 0 ? "text-green-600" : "text-gray-400",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                </svg>
            ),
        },
        {
            label: "Scheduled",
            value: pad(visitStats.scheduledToday),
            sub:
                visitStats.scheduledConfirmed > 0
                    ? `${visitStats.scheduledConfirmed} confirmed`
                    : "for today",
            subColor: "text-gray-500",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                </svg>
            ),
        },
        {
            label: "Meeting Done",
            value: pad(visitStats.meetingsDoneToday),
            sub: "completed today",
            subColor: "text-gray-500",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            ),
        },
        {
            label: "Ongoing Mtgs",
            value: pad(visitStats.ongoingMeetings),
            sub: `/ ${visitStats.totalRooms} Rooms`,
            subColor: "text-gray-500",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
            ),
        },
    ];

    return (
        <section className="mx-auto max-w-7xl px-8 pt-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    <h2 className="text-lg font-bold text-gray-900">Today&apos;s Visits</h2>
                </div>
                <a href="#" className="text-sm font-semibold text-blue-600 hover:underline">
                    Open Calendar →
                </a>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {visitStatsCards.map((stat) => (
                    <div
                        key={stat.label}
                        className="h-36 rounded-xl border border-dashed border-gray-300 bg-white p-5"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                            {stat.icon}
                        </div>
                        <div className="mt-8 flex items-end gap-2">
                            <span className="text-4xl font-bold text-gray-900">{stat.value}</span>
                            <span className={`mb-1 text-sm font-medium ${stat.subColor}`}>
                                {stat.sub}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
