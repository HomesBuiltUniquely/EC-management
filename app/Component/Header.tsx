'use client';

import { useRouter } from "next/navigation";
import { FormPopup } from "./FormPopup";
import { UnderConstructionModal } from "./UnderConstructionModal";
import React from "react";

export default function Header() {
    const router = useRouter();
    const [showForm, setShowForm] = React.useState(false);
    const [underConstruction, setUnderConstruction] = React.useState<string | null>(null);

    function launchQuiz(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        router.push("https://design.hubinterior.com/DesignQA");
    }

    function launchForm(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        setShowForm(true);
    }

    function showUnderConstruction(
        event: React.MouseEvent<HTMLButtonElement>,
        featureName: string
    ): void {
        event.preventDefault();
        setUnderConstruction(featureName);
    }

    return (
        <section className="border-b border-dashed border-gray-200 bg-white">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-8 py-10">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Experience Center Management
                    </h1>
                    <p className="mt-2 max-w-xl text-sm text-gray-500">
                        Manage walk-ins, scheduled visits, and showroom operations in one place.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={(e) => showUnderConstruction(e, "View Calendar")}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                        </svg>
                        View Calendar
                    </button>
                    <button
                        type="button"
                        onClick={launchQuiz}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Launch Quiz
                    </button>
                    <button
                        type="button"
                        onClick={(e) => showUnderConstruction(e, "Today's Report")}
                        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        Today&apos;s Report
                    </button>
                    <button
                        type="button"
                        onClick={launchForm}
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                        + New Walk-In Form
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 pt-8 backdrop-blur-sm sm:items-center sm:pt-4">
                    <FormPopup onClose={() => setShowForm(false)} />
                </div>
            )}

            {underConstruction && (
                <UnderConstructionModal
                    featureName={underConstruction}
                    onClose={() => setUnderConstruction(null)}
                />
            )}
        </section>
    );
}
