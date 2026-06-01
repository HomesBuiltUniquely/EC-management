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

export function placeholders(count: number): string {
    return Array(count).fill("?").join(",");
}
