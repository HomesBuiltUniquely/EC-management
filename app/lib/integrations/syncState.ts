import type { RowDataPacket } from "mysql2";
import { getPool } from "../mysql";
import { defaultSinceDaysAgo } from "./meetingTime";

type SyncStateRow = RowDataPacket & {
    source: string;
    last_synced_at: string;
};

export async function getLastSyncedAt(source: string): Promise<string> {
    const pool = getPool();
    const [rows] = await pool.query<SyncStateRow[]>(
        "SELECT last_synced_at FROM integration_sync_state WHERE source = ? LIMIT 1",
        [source]
    );
    if (rows[0]?.last_synced_at) {
        return rows[0].last_synced_at;
    }
    return defaultSinceDaysAgo(7);
}

export async function setLastSyncedAt(source: string, lastSyncedAt: string): Promise<void> {
    const pool = getPool();
    await pool.query(
        `INSERT INTO integration_sync_state (source, last_synced_at, updated_at)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE last_synced_at = VALUES(last_synced_at), updated_at = VALUES(updated_at)`,
        [source, lastSyncedAt, Date.now()]
    );
}
