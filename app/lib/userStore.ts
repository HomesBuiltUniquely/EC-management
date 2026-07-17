import { createHash, randomBytes } from "crypto";
import type { RowDataPacket } from "mysql2";
import { validateHubInteriorEmail } from "./emailRules";
import { ensureSchema, getPool } from "./mysql";
import { isEcBranch, type EcBranch } from "./branches";

export type ReceptionistRecord = {
    id: string;
    email: string;
    name: string;
    branch: EcBranch;
    passwordHash: string;
    createdAt: string;
    active: boolean;
};

export type ReceptionistPublic = {
    id: string;
    email: string;
    name: string;
    branch: EcBranch;
    createdAt: string;
    active: boolean;
};

type ReceptionistRow = RowDataPacket & {
    id: string;
    email: string;
    name: string;
    branch: EcBranch;
    password_hash: string;
    active: number;
    created_at: Date;
};

function hashPassword(password: string): string {
    const salt = process.env.EC_AUTH_SALT ?? "ec-hows-salt";
    return createHash("sha256")
        .update(`${salt}:${password}`)
        .digest("hex");
}

function toPublic(record: ReceptionistRecord): ReceptionistPublic {
    return {
        id: record.id,
        email: record.email,
        name: record.name,
        branch: record.branch,
        createdAt: record.createdAt,
        active: record.active,
    };
}

function fromRow(row: ReceptionistRow): ReceptionistRecord {
    return {
        id: row.id,
        email: row.email,
        name: row.name,
        branch: row.branch,
        passwordHash: row.password_hash,
        active: Boolean(row.active),
        createdAt:
            row.created_at instanceof Date
                ? row.created_at.toISOString()
                : String(row.created_at),
    };
}

export async function listReceptionists(): Promise<ReceptionistPublic[]> {
    await ensureSchema();
    const pool = getPool();
    const [rows] = await pool.query<ReceptionistRow[]>(
        "SELECT * FROM receptionists ORDER BY created_at DESC"
    );
    return rows.map((r) => toPublic(fromRow(r)));
}

export async function findReceptionistByEmail(
    email: string
): Promise<ReceptionistRecord | null> {
    await ensureSchema();
    const normalized = email.trim().toLowerCase();
    const pool = getPool();
    const [rows] = await pool.query<ReceptionistRow[]>(
        "SELECT * FROM receptionists WHERE email = ? AND active = 1 LIMIT 1",
        [normalized]
    );
    return rows[0] ? fromRow(rows[0]) : null;
}

export async function validateReceptionistPassword(
    email: string,
    password: string
): Promise<ReceptionistRecord | null> {
    const user = await findReceptionistByEmail(email);
    if (!user) return null;
    if (user.passwordHash !== hashPassword(password)) return null;
    return user;
}

export async function createReceptionist(input: {
    email: string;
    name: string;
    password: string;
    branch: EcBranch;
}): Promise<{ ok: true; user: ReceptionistPublic } | { ok: false; error: string }> {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    const password = input.password;
    const branch = input.branch;

    const emailError = validateHubInteriorEmail(email);
    if (emailError) {
        return { ok: false, error: emailError };
    }
    if (!name) {
        return { ok: false, error: "Name is required." };
    }
    if (!isEcBranch(branch)) {
        return { ok: false, error: "Select a valid branch." };
    }
    if (password.length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
    }

    await ensureSchema();
    const pool = getPool();
    const [existing] = await pool.query<RowDataPacket[]>(
        "SELECT id FROM receptionists WHERE email = ? LIMIT 1",
        [email]
    );
    if (existing.length > 0) {
        return { ok: false, error: "A receptionist with this email already exists." };
    }

    const id = randomBytes(8).toString("hex");
    await pool.query(
        `INSERT INTO receptionists (id, email, name, branch, password_hash, active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [id, email, name, branch, hashPassword(password)]
    );

    const [rows] = await pool.query<ReceptionistRow[]>(
        "SELECT * FROM receptionists WHERE id = ?",
        [id]
    );

    return { ok: true, user: toPublic(fromRow(rows[0])) };
}

export async function deactivateReceptionist(
    id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    await ensureSchema();
    const pool = getPool();
    const [result] = await pool.query(
        "UPDATE receptionists SET active = 0 WHERE id = ?",
        [id]
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
        return { ok: false, error: "Receptionist not found." };
    }
    return { ok: true };
}

export async function updateReceptionistPassword(
    id: string,
    password: string
): Promise<{ ok: true } | { ok: false; error: string }> {
    if (password.length < 6) {
        return { ok: false, error: "Password must be at least 6 characters." };
    }
    await ensureSchema();
    const pool = getPool();
    const [result] = await pool.query(
        "UPDATE receptionists SET password_hash = ? WHERE id = ?",
        [hashPassword(password), id]
    );
    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
        return { ok: false, error: "Receptionist not found." };
    }
    return { ok: true };
}
