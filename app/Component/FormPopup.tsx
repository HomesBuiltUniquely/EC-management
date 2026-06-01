"use client";

import { useState } from "react";
import { useRooms } from "../context/RoomContext";
import { RequirementGrid } from "./RequirementGrid";
import {
    createEmptyRequirements,
    PROPERTY_TYPES,
    PROPERTY_USES,
    type RoomRequirements,
} from "./Type/WalkInFormConfig";

const labelClass = "mb-1 block text-xs font-semibold text-gray-700";
const inputClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const selectClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white pl-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";
const sectionBodyClass =
    "grid grid-cols-1 gap-3 border border-t-0 border-gray-200 bg-white p-4 sm:grid-cols-2";

interface FormPopupProps {
    onClose: () => void;
}

function todayInputValue(): string {
    return new Date().toISOString().slice(0, 10);
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold uppercase tracking-wider text-blue-800">
            {children}
        </h3>
    );
}

export function FormPopup({ onClose }: FormPopupProps) {
    const { addWalkIn, staffName } = useRooms();

    const [designer, setDesigner] = useState(staffName);
    const [formDate, setFormDate] = useState(todayInputValue());
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [expectedMoveIn, setExpectedMoveIn] = useState("");
    const [alternatePhone, setAlternatePhone] = useState("");
    const [residingAddress, setResidingAddress] = useState("");
    const [propertyName, setPropertyName] = useState("");
    const [propertyAddress, setPropertyAddress] = useState("");
    const [propertyType, setPropertyType] = useState<string>(PROPERTY_TYPES[0]);
    const [propertyUse, setPropertyUse] = useState<string>(PROPERTY_USES[0]);
    const [budget, setBudget] = useState("");
    const [possession, setPossession] = useState("");
    const [requirements, setRequirements] = useState<RoomRequirements>(
        createEmptyRequirements
    );
    const [alsoSchedule, setAlsoSchedule] = useState(false);
    const [scheduleTime, setScheduleTime] = useState("");
    const [scheduleEnd, setScheduleEnd] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function parseApiResponse(res: Response) {
        const text = await res.text();
        try {
            return text ? JSON.parse(text) : {};
        } catch {
            return {
                error:
                    res.status === 404
                        ? "Walk-in API route not found. Restart Next.js dev server."
                        : `Unexpected response (${res.status}): ${text.slice(0, 120)}`,
            };
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim() || !email.trim() || !phone.trim()) {
            setError("Name, email, and contact number are required.");
            return;
        }
        if (alsoSchedule && !scheduleTime.trim()) {
            setError("Please set a meeting time when scheduling for today.");
            return;
        }

        const walkInInput = {
            designer,
            formDate,
            name,
            email,
            phone,
            alternatePhone,
            expectedMoveIn,
            residingAddress,
            propertyName,
            propertyAddress,
            propertyType,
            propertyUse,
            budget: budget || "—",
            possession,
            requirements,
            scheduleTime: alsoSchedule ? scheduleTime : undefined,
            scheduleEnd: alsoSchedule ? scheduleEnd : undefined,
        };

        setSubmitting(true);
        setError("");
        setSuccess("");

        try {
            console.log("[WalkinLead] Submitting walk-in form…", walkInInput);

            const res = await fetch("/api/walkin-lead", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(walkInInput),
            });

            const data = await parseApiResponse(res);

            console.log("[WalkinLead] API response:", res.status, data);

            if (!res.ok) {
                setError(
                    (data as { error?: string }).error ??
                        "Failed to submit walk-in to server."
                );
                return;
            }

            addWalkIn(walkInInput);
            setSuccess("Walk-in saved and sent to the server successfully.");

            setTimeout(() => onClose(), 800);
        } catch (err) {
            console.error("[WalkinLead] Submit failed:", err);
            setError("Unable to connect. Please check the walk-in API and try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="z-50 mx-auto flex max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-blue-100 bg-blue-600 px-4 py-3 sm:px-6">
                <div className="text-lg font-bold text-white">Walk-in Form</div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-md border border-white/40 px-3 py-1 text-sm font-semibold text-white hover:bg-white/20"
                >
                    close
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
                <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-gray-50 p-4 sm:p-6">
                    {error && (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            {success}
                        </p>
                    )}
                    {submitting && (
                        <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                            Sending to WalkinLead API…
                        </p>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Designer</label>
                            <input
                                value={designer}
                                onChange={(e) => setDesigner(e.target.value)}
                                className={inputClass}
                                placeholder="Designer name"
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Date</label>
                            <input
                                type="date"
                                value={formDate}
                                onChange={(e) => setFormDate(e.target.value)}
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <SectionTitle>Customer Details</SectionTitle>
                        <div className={sectionBodyClass}>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Name</label>
                                <input
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Contact No</label>
                                <input
                                    required
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Email ID</label>
                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Expected Move In</label>
                                <input
                                    value={expectedMoveIn}
                                    onChange={(e) => setExpectedMoveIn(e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Dec 2026"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Alternate Contact No</label>
                                <input
                                    value={alternatePhone}
                                    onChange={(e) => setAlternatePhone(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className={labelClass}>Residing Address</label>
                                <textarea
                                    value={residingAddress}
                                    onChange={(e) => setResidingAddress(e.target.value)}
                                    rows={3}
                                    className={`${inputClass} min-h-[72px] resize-y py-2`}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionTitle>Property Details</SectionTitle>
                        <div className={sectionBodyClass}>
                            <div>
                                <label className={labelClass}>Property Name</label>
                                <input
                                    value={propertyName}
                                    onChange={(e) => setPropertyName(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Property Address</label>
                                <input
                                    value={propertyAddress}
                                    onChange={(e) => setPropertyAddress(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Property Type</label>
                                <select
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className={selectClass}
                                >
                                    {PROPERTY_TYPES.map((t) => (
                                        <option key={t} value={t}>
                                            {t}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Property Use</label>
                                <select
                                    value={propertyUse}
                                    onChange={(e) => setPropertyUse(e.target.value)}
                                    className={selectClass}
                                >
                                    {PROPERTY_USES.map((u) => (
                                        <option key={u} value={u}>
                                            {u}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Budget</label>
                                <input
                                    value={budget}
                                    onChange={(e) => setBudget(e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. 10 - 20 Lakhs"
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Possession</label>
                                <input
                                    value={possession}
                                    onChange={(e) => setPossession(e.target.value)}
                                    className={inputClass}
                                    placeholder="e.g. Ready / 3 months"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <SectionTitle>Requirement</SectionTitle>
                        <div className="border border-t-0 border-gray-200 bg-white p-4">
                            <p className="mb-3 text-xs text-gray-500">
                                Tick items needed and add notes per room (Kitchen, Living
                                Room, Foyer, Bedrooms).
                            </p>
                            <RequirementGrid
                                value={requirements}
                                onChange={setRequirements}
                            />
                        </div>
                    </div>

                    <div className="rounded-md border border-blue-100 bg-blue-50/50 p-3">
                        <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                            <input
                                type="checkbox"
                                checked={alsoSchedule}
                                onChange={(e) => setAlsoSchedule(e.target.checked)}
                                className="accent-blue-600"
                            />
                            Schedule meeting for today
                        </label>
                        {alsoSchedule && (
                            <div className="mt-3 grid max-w-md grid-cols-2 gap-2">
                                <input
                                    type="time"
                                    required={alsoSchedule}
                                    value={scheduleTime}
                                    onChange={(e) => setScheduleTime(e.target.value)}
                                    className={inputClass}
                                />
                                <input
                                    value={scheduleEnd}
                                    onChange={(e) => setScheduleEnd(e.target.value)}
                                    placeholder="End e.g. 11:30 AM"
                                    className={inputClass}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 justify-end border-t border-gray-200 bg-white p-4 sm:px-6">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="h-11 min-w-[160px] rounded-lg bg-blue-600 px-6 font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Submit Form"}
                    </button>
                </div>
            </form>
        </div>
    );
}
