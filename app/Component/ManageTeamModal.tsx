"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReceptionistPublic } from "../lib/auth";
import { HUB_EMAIL_DOMAIN, validateHubInteriorEmail } from "../lib/emailRules";

const inputClass =
    "h-9 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20";

type ManageTeamModalProps = {
    onClose: () => void;
};

export function ManageTeamModal({ onClose }: ManageTeamModalProps) {
    const [receptionists, setReceptionists] = useState<ReceptionistPublic[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [creating, setCreating] = useState(false);

    const [resetId, setResetId] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState("");

    const loadTeam = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/receptionists");
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Failed to load team.");
                return;
            }
            setReceptionists(data.receptionists ?? []);
        } catch {
            setError("Unable to load receptionist accounts.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTeam();
    }, [loadTeam]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        const emailError = validateHubInteriorEmail(email);
        if (emailError) {
            setError(emailError);
            return;
        }

        setCreating(true);
        try {
            const res = await fetch("/api/auth/receptionists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Could not create account.");
                return;
            }
            setSuccess(`Access created for ${data.receptionist.name}.`);
            setName("");
            setEmail("");
            setPassword("");
            await loadTeam();
        } catch {
            setError("Unable to create account.");
        } finally {
            setCreating(false);
        }
    }

    async function handleDeactivate(id: string, displayName: string) {
        if (!confirm(`Deactivate access for ${displayName}? They will no longer be able to sign in.`)) {
            return;
        }
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/auth/receptionists/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Could not deactivate account.");
                return;
            }
            setSuccess(`${displayName} has been deactivated.`);
            await loadTeam();
        } catch {
            setError("Unable to deactivate account.");
        }
    }

    async function handleResetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!resetId) return;
        setError("");
        setSuccess("");
        try {
            const res = await fetch(`/api/auth/receptionists/${resetId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: newPassword }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? "Could not reset password.");
                return;
            }
            setSuccess("Password updated. Share the new password with the receptionist securely.");
            setResetId(null);
            setNewPassword("");
        } catch {
            setError("Unable to reset password.");
        }
    }

    const active = receptionists.filter((r) => r.active);
    const inactive = receptionists.filter((r) => !r.active);

    return (
        <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8">
            <div className="mb-8 flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="shrink-0 border-b border-blue-100 bg-blue-600 px-6 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                Manage Receptionist Access
                            </h2>
                            <p className="mt-1 text-sm text-blue-100">
                                Only admins can create accounts. Passwords are never
                                shown after creation.
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
                    {error && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {error}
                        </p>
                    )}
                    {success && (
                        <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                            {success}
                        </p>
                    )}

                    <form
                        onSubmit={handleCreate}
                        className="rounded-xl border border-blue-100 bg-blue-50/40 p-4"
                    >
                        <h3 className="text-sm font-bold text-gray-900">
                            Create receptionist login
                        </h3>
                        <p className="mt-1 text-xs text-gray-500">
                            Email must end with {HUB_EMAIL_DOMAIN}. They sign in with
                            only these credentials — admin password stays separate.
                        </p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Full name
                                </label>
                                <input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className={inputClass}
                                    placeholder="Priya Singh"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className={inputClass}
                                    placeholder={`name${HUB_EMAIL_DOMAIN}`}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-semibold text-gray-600">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    className={inputClass}
                                    placeholder="Min. 6 characters"
                                    autoComplete="new-password"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={creating}
                            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            {creating ? "Creating..." : "Create access"}
                        </button>
                    </form>

                    <div>
                        <h3 className="mb-3 text-sm font-bold text-gray-900">
                            Active receptionists ({active.length})
                        </h3>
                        {loading ? (
                            <p className="text-sm text-gray-400">Loading...</p>
                        ) : active.length === 0 ? (
                            <p className="rounded-lg border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                                No receptionist accounts yet. Create one above.
                            </p>
                        ) : (
                            <ul className="space-y-2">
                                {active.map((r) => (
                                    <li
                                        key={r.id}
                                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3"
                                    >
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {r.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {r.email}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setResetId(r.id);
                                                    setNewPassword("");
                                                    setSuccess("");
                                                    setError("");
                                                }}
                                                className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
                                            >
                                                Reset password
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeactivate(r.id, r.name)
                                                }
                                                className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                                            >
                                                Deactivate
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {inactive.length > 0 && (
                        <div>
                            <h3 className="mb-2 text-sm font-bold text-gray-500">
                                Deactivated ({inactive.length})
                            </h3>
                            <ul className="space-y-1 text-sm text-gray-400">
                                {inactive.map((r) => (
                                    <li key={r.id}>
                                        {r.name} · {r.email}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {resetId && (
                        <form
                            onSubmit={handleResetPassword}
                            className="rounded-xl border border-amber-200 bg-amber-50 p-4"
                        >
                            <h3 className="text-sm font-bold text-gray-900">
                                Set new password
                            </h3>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className={`${inputClass} mt-2`}
                                placeholder="New password"
                                autoComplete="new-password"
                            />
                            <div className="mt-3 flex gap-2">
                                <button
                                    type="submit"
                                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700"
                                >
                                    Save password
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setResetId(null)}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
