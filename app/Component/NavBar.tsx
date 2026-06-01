"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SessionUser } from "../dashboard/layout";
import { HowsLogo } from "./HowsLogo";
import { ManageTeamModal } from "./ManageTeamModal";
import { RoomsDetailsModal } from "./RoomsDetailsModal";
import { UnderConstructionModal } from "./UnderConstructionModal";

type NavId = "dashboard" | "calendar" | "designers" | "rooms" | "reports";

const navItems: { id: NavId; label: string }[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "calendar", label: "Calendar" },
    { id: "designers", label: "Designers" },
    { id: "rooms", label: "Rooms" },
    { id: "reports", label: "Reports" },
];

export function NavBar({ user }: { user: SessionUser | null }) {
    const router = useRouter();
    const [activeNav, setActiveNav] = useState<NavId>("dashboard");
    const [underConstruction, setUnderConstruction] = useState<string | null>(
        null
    );
    const [roomsOpen, setRoomsOpen] = useState(false);
    const [teamOpen, setTeamOpen] = useState(false);

    const isAdmin = user?.role === "Admin";

    function handleNavClick(id: NavId) {
        setActiveNav(id);
        if (id === "dashboard") {
            router.push("/dashboard");
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        if (id === "rooms") {
            setRoomsOpen(true);
            return;
        }
        const label = navItems.find((n) => n.id === id)?.label ?? id;
        setUnderConstruction(label);
    }

    async function handleLogout() {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
    }

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <header className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
                <div className="flex items-center gap-2">
                    <HowsLogo size={32} />
                    <span className="text-sm font-bold text-gray-900">
                        HOWS <span className="font-normal text-gray-400">| Experience Center</span>
                    </span>
                </div>

                <nav className="hidden items-center gap-8 md:flex">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => handleNavClick(item.id)}
                            className={`text-sm font-medium ${
                                activeNav === item.id
                                    ? "text-blue-600"
                                    : "text-gray-500 hover:text-gray-900"
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <button
                            type="button"
                            onClick={() => setTeamOpen(true)}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                        >
                            Team Access
                        </button>
                    )}

                    <button
                        type="button"
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Notifications"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                    </button>

                    {user && (
                        <div className="hidden items-center gap-2 sm:flex">
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.role}</p>
                            </div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                {initials}
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {underConstruction && (
                <UnderConstructionModal
                    featureName={underConstruction}
                    onClose={() => {
                        setUnderConstruction(null);
                        setActiveNav("dashboard");
                    }}
                />
            )}

            {roomsOpen && (
                <RoomsDetailsModal
                    onClose={() => {
                        setRoomsOpen(false);
                        setActiveNav("dashboard");
                    }}
                />
            )}

            {teamOpen && isAdmin && (
                <ManageTeamModal onClose={() => setTeamOpen(false)} />
            )}
        </header>
    );
}
