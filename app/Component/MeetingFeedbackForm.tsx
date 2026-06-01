"use client";

import { useState } from "react";
import {
    validateFeedback,
    type ComfortLevel,
    type ConfidenceLevel,
    type ListenLevel,
    type MeetingFeedbackInput,
    type QueriesLevel,
    type Rating4,
    type SatisfactionLevel,
    type TransparencyLevel,
} from "./Type/FeedbackType";
import type { FloorRoom } from "./Type/FloorRoomType";

const labelClass = "mb-1 block text-xs font-semibold text-gray-700";
const inputClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <h3 className="border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800">
            {children}
        </h3>
    );
}

function RadioGroup<T extends string>({
    label,
    name,
    options,
    value,
    onChange,
    required,
}: {
    label: string;
    name: string;
    options: readonly T[];
    value: T | "";
    onChange: (v: T) => void;
    required?: boolean;
}) {
    return (
        <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-gray-800">
                {label}
                {required && <span className="text-red-500"> *</span>}
            </legend>
            <div className="flex flex-wrap gap-3">
                {options.map((opt) => (
                    <label
                        key={opt}
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
                            value === opt
                                ? "border-blue-500 bg-blue-50 text-blue-800"
                                : "border-gray-200 text-gray-600"
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            checked={value === opt}
                            onChange={() => onChange(opt)}
                            className="accent-blue-600"
                        />
                        {opt}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}

type MeetingFeedbackFormProps = {
    room: FloorRoom;
    onSubmit: (feedback: MeetingFeedbackInput) => void;
};

export function MeetingFeedbackForm({ room, onSubmit }: MeetingFeedbackFormProps) {
    const [error, setError] = useState("");

    const [customerName, setCustomerName] = useState(room.leadName ?? "");
    const [visitDate, setVisitDate] = useState(
        new Date().toISOString().slice(0, 10)
    );
    const [designerName, setDesignerName] = useState(room.withName ?? "");
    const [salesRepName, setSalesRepName] = useState(room.bookedBy ?? "");

    const [designerUnderstand, setDesignerUnderstand] = useState<Rating4 | "">("");
    const [designerExplain, setDesignerExplain] = useState<Rating4 | "">("");
    const [designerConfidence, setDesignerConfidence] = useState<
        ConfidenceLevel | ""
    >("");
    const [designerListen, setDesignerListen] = useState<ListenLevel | "">("");
    const [designerOverall, setDesignerOverall] = useState<SatisfactionLevel | "">(
        ""
    );
    const [designTeamSuggestions, setDesignTeamSuggestions] = useState("");

    const [salesExplainProcess, setSalesExplainProcess] = useState<Rating4 | "">("");
    const [salesComfort, setSalesComfort] = useState<ComfortLevel | "">("");
    const [salesTransparent, setSalesTransparent] = useState<TransparencyLevel | "">(
        ""
    );
    const [salesQueries, setSalesQueries] = useState<QueriesLevel | "">("");
    const [salesOverall, setSalesOverall] = useState<Rating4 | "">("");
    const [salesTeamFeedback, setSalesTeamFeedback] = useState("");

    const [recommendScore, setRecommendScore] = useState<number | null>(null);
    const [followUpWanted, setFollowUpWanted] = useState<"yes" | "no" | "">("");
    const [followUpPhone, setFollowUpPhone] = useState("");

    const rating4 = ["Excellent", "Good", "Average", "Poor"] as const;

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const payload: MeetingFeedbackInput = {
            customerName,
            visitDate,
            designerName,
            salesRepName,
            designerUnderstand: designerUnderstand as Rating4,
            designerExplain: designerExplain as Rating4,
            designerConfidence: designerConfidence as ConfidenceLevel,
            designerListen: designerListen as ListenLevel,
            designerOverall: designerOverall as SatisfactionLevel,
            designTeamSuggestions,
            salesExplainProcess: salesExplainProcess as Rating4,
            salesComfort: salesComfort as ComfortLevel,
            salesTransparent: salesTransparent as TransparencyLevel,
            salesQueries: salesQueries as QueriesLevel,
            salesOverall: salesOverall as Rating4,
            salesTeamFeedback,
            recommendScore: recommendScore ?? -1,
            followUpWanted: followUpWanted as "yes" | "no",
            followUpPhone,
        };
        const validationError = validateFeedback(payload);
        if (validationError) {
            setError(validationError);
            return;
        }
        onSubmit(payload);
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
            <div className="mb-8 flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="shrink-0 border-b border-blue-100 bg-blue-600 px-6 py-4">
                    <h2 className="text-lg font-bold text-white">
                        Customer Feedback Form — Experience Centre Visit
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">
                        Meeting ended at <strong>{room.name}</strong> — feedback is
                        required before the room is released.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <div className="max-h-[65vh] space-y-6 overflow-y-auto bg-gray-50 p-6">
                        {error && (
                            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </p>
                        )}

                        <p className="text-sm text-gray-600">
                            Thank you for visiting us! Please share feedback — it helps
                            us serve you better.
                        </p>

                        <div>
                            <SectionTitle>Customer Information</SectionTitle>
                            <div className="grid gap-3 border border-t-0 border-gray-200 bg-white p-4 sm:grid-cols-2">
                                <div>
                                    <label className={labelClass}>Name</label>
                                    <input
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Date of Visit</label>
                                    <input
                                        type="date"
                                        value={visitDate}
                                        onChange={(e) => setVisitDate(e.target.value)}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Designer&apos;s Name</label>
                                    <input
                                        value={designerName}
                                        onChange={(e) => setDesignerName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>
                                        Sales Representative&apos;s Name
                                    </label>
                                    <input
                                        value={salesRepName}
                                        onChange={(e) => setSalesRepName(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                            <SectionTitle>Designer Interaction</SectionTitle>
                            <div className="space-y-5 p-4">
                                <RadioGroup
                                    label="How well did the designer understand your requirements and preferences?"
                                    name="d1"
                                    options={rating4}
                                    value={designerUnderstand}
                                    onChange={setDesignerUnderstand}
                                    required
                                />
                                <RadioGroup
                                    label="How effectively did the designer explain the design ideas and solutions to you?"
                                    name="d2"
                                    options={rating4}
                                    value={designerExplain}
                                    onChange={setDesignerExplain}
                                    required
                                />
                                <RadioGroup
                                    label="How confident did you feel about the designer's knowledge and creativity?"
                                    name="d3"
                                    options={[
                                        "Very Confident",
                                        "Somewhat Confident",
                                        "Neutral",
                                        "Not Confident",
                                    ]}
                                    value={designerConfidence}
                                    onChange={setDesignerConfidence}
                                    required
                                />
                                <RadioGroup
                                    label="Did the designer actively listen to your concerns and provide suggestions accordingly?"
                                    name="d4"
                                    options={["Yes", "Sometimes", "Rarely", "Never"]}
                                    value={designerListen}
                                    onChange={setDesignerListen}
                                    required
                                />
                                <RadioGroup
                                    label="Overall, how satisfied are you with the designer's interaction and presentation?"
                                    name="d5"
                                    options={[
                                        "Very Satisfied",
                                        "Satisfied",
                                        "Neutral",
                                        "Dissatisfied",
                                    ]}
                                    value={designerOverall}
                                    onChange={setDesignerOverall}
                                    required
                                />
                                <div>
                                    <label className={labelClass}>
                                        Any suggestions or feedback for our Design Team?
                                    </label>
                                    <textarea
                                        value={designTeamSuggestions}
                                        onChange={(e) =>
                                            setDesignTeamSuggestions(e.target.value)
                                        }
                                        rows={2}
                                        className={`${inputClass} min-h-[60px] resize-y py-2`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                            <SectionTitle>Sales Interaction</SectionTitle>
                            <div className="space-y-5 p-4">
                                <RadioGroup
                                    label="How clearly did the sales representative explain our process, timelines, and pricing?"
                                    name="s1"
                                    options={rating4}
                                    value={salesExplainProcess}
                                    onChange={setSalesExplainProcess}
                                    required
                                />
                                <RadioGroup
                                    label="Did you feel comfortable and well-assisted during the entire session?"
                                    name="s2"
                                    options={[
                                        "Yes, completely",
                                        "To some extent",
                                        "Not really",
                                        "Not at all",
                                    ]}
                                    value={salesComfort}
                                    onChange={setSalesComfort}
                                    required
                                />
                                <RadioGroup
                                    label="How transparent was the sales representative while discussing costs or offers?"
                                    name="s3"
                                    options={[
                                        "Very Transparent",
                                        "Somewhat Transparent",
                                        "Neutral",
                                        "Not Transparent",
                                    ]}
                                    value={salesTransparent}
                                    onChange={setSalesTransparent}
                                    required
                                />
                                <RadioGroup
                                    label="Did the sales representative address all your queries and doubts effectively?"
                                    name="s4"
                                    options={[
                                        "All of them",
                                        "Most of them",
                                        "Few of them",
                                        "None",
                                    ]}
                                    value={salesQueries}
                                    onChange={setSalesQueries}
                                    required
                                />
                                <RadioGroup
                                    label="Overall, how would you rate your experience with the sales team today?"
                                    name="s5"
                                    options={rating4}
                                    value={salesOverall}
                                    onChange={setSalesOverall}
                                    required
                                />
                                <div>
                                    <label className={labelClass}>
                                        Any feedback for our Sales Team?
                                    </label>
                                    <textarea
                                        value={salesTeamFeedback}
                                        onChange={(e) => setSalesTeamFeedback(e.target.value)}
                                        rows={2}
                                        className={`${inputClass} min-h-[60px] resize-y py-2`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4">
                            <SectionTitle>Overall Experience</SectionTitle>
                            <div className="space-y-5 p-4">
                                <fieldset>
                                    <legend className="text-sm font-medium text-gray-800">
                                        Would you recommend our brand to friends or family?
                                        (0 = Not likely, 10 = Definitely will)
                                        <span className="text-red-500"> *</span>
                                    </legend>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {Array.from({ length: 11 }, (_, i) => (
                                            <label
                                                key={i}
                                                className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold ${
                                                    recommendScore === i
                                                        ? "border-blue-600 bg-blue-600 text-white"
                                                        : "border-gray-200 text-gray-600 hover:border-blue-400"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="nps"
                                                    className="sr-only"
                                                    checked={recommendScore === i}
                                                    onChange={() => setRecommendScore(i)}
                                                />
                                                {i}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>

                                <RadioGroup
                                    label="Would you like someone from our team to connect with you for additional queries or feedback?"
                                    name="followup"
                                    options={["yes", "no"] as const}
                                    value={followUpWanted}
                                    onChange={(v) =>
                                        setFollowUpWanted(v as "yes" | "no")
                                    }
                                    required
                                />
                                {followUpWanted === "yes" && (
                                    <div>
                                        <label className={labelClass}>
                                            Preferred contact number
                                            <span className="text-red-500"> *</span>
                                        </label>
                                        <input
                                            value={followUpPhone}
                                            onChange={(e) => setFollowUpPhone(e.target.value)}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <p className="text-center text-sm font-semibold text-gray-700">
                            Thank you
                        </p>
                    </div>

                    <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
                        <button
                            type="submit"
                            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                        >
                            Submit feedback & release room
                        </button>
                        <p className="mt-2 text-center text-xs text-gray-500">
                            This form must be completed to end the meeting.
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
