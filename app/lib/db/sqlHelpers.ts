import type { PoolConnection } from "mysql2/promise";

/** Expand NOT IN (?) for mysql2 — avoids invalid `NOT IN (?)` with array param */
export async function deleteIdsNotIn(
    conn: PoolConnection,
    table: string,
    idColumn: string,
    ids: string[],
    branch?: string
): Promise<void> {
    const branchClause = branch ? " WHERE `branch` = ?" : "";
    const branchParams = branch ? [branch] : [];
    if (ids.length === 0) {
        await conn.query(`DELETE FROM \`${table}\`${branchClause}`, branchParams);
        return;
    }
    const placeholders = ids.map(() => "?").join(", ");
    await conn.query(
        `DELETE FROM \`${table}\`
         WHERE ${branch ? "`branch` = ? AND " : ""}\`${idColumn}\` NOT IN (${placeholders})`,
        [...branchParams, ...ids]
    );
}

/** Only delete manual walk-ins missing from client payload — preserves CRM/Design sync rows. */
export async function deleteManualWalkInsNotIn(
    conn: PoolConnection,
    ids: string[],
    branch: string
): Promise<void> {
    if (ids.length === 0) {
        await conn.query(
            `DELETE FROM walk_ins
             WHERE branch = ? AND (source IS NULL OR source = 'manual')`,
            [branch]
        );
        return;
    }
    const ph = ids.map(() => "?").join(", ");
    await conn.query(
        `DELETE FROM walk_ins
         WHERE (source IS NULL OR source = 'manual')
           AND branch = ?
           AND id NOT IN (${ph})`,
        [branch, ...ids]
    );
}

export function placeholders(count: number): string {
    return Array(count).fill("?").join(",");
}
