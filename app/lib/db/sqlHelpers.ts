import type { PoolConnection } from "mysql2/promise";

/** Expand NOT IN (?) for mysql2 — avoids invalid `NOT IN (?)` with array param */
export async function deleteIdsNotIn(
    conn: PoolConnection,
    table: string,
    idColumn: string,
    ids: string[]
): Promise<void> {
    if (ids.length === 0) {
        await conn.query(`DELETE FROM \`${table}\``);
        return;
    }
    const placeholders = ids.map(() => "?").join(", ");
    await conn.query(
        `DELETE FROM \`${table}\` WHERE \`${idColumn}\` NOT IN (${placeholders})`,
        ids
    );
}

/** Only delete manual walk-ins missing from client payload — preserves CRM/Design sync rows. */
export async function deleteManualWalkInsNotIn(
    conn: PoolConnection,
    ids: string[]
): Promise<void> {
    if (ids.length === 0) {
        await conn.query(
            `DELETE FROM walk_ins WHERE source IS NULL OR source = 'manual'`
        );
        return;
    }
    const ph = ids.map(() => "?").join(", ");
    await conn.query(
        `DELETE FROM walk_ins
         WHERE (source IS NULL OR source = 'manual')
           AND id NOT IN (${ph})`,
        ids
    );
}

export function placeholders(count: number): string {
    return Array(count).fill("?").join(",");
}
