"use client";

import { RoomProvider } from "../context/RoomContext";
import type { SessionUser } from "../dashboard/layout";

export function DashboardProviders({
    children,
    user,
}: {
    children: React.ReactNode;
    user: SessionUser | null;
}) {
    return (
        <RoomProvider
            key={user?.branch ?? "default"}
            bookedBy={user?.name ?? "Staff"}
            branch={user?.branch}
        >
            {children}
        </RoomProvider>
    );
}
