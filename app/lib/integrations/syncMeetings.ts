import type { ScheduledMeeting } from "../../Component/Type/VisitType";
import { ensureSchema, getPool } from "../mysql";
import { placeholders } from "../db/sqlHelpers";
import { externalMeetingToScheduled } from "./normalizeMeeting";
import { getLastSyncedAt, setLastSyncedAt } from "./syncState";
import type {
    ExternalMeetingListItem,
    MeetingSource,
    SyncMeetingsResult,
    SyncSourceResult,
} from "./types";
import { maxIsoLocalDateTime } from "./meetingTime";

function envTrim(name: string): string {
    return (process.env[name] || "").trim();
}

async function fetchRecentMeetings(
    baseUrl: string,
    path: string,
    apiKey: string,
    since: string
): Promise<ExternalMeetingListItem[]> {
    const root = baseUrl.replace(/\/$/, "");
    const url = `${root}${path}?since=${encodeURIComponent(since)}`;
    const res = await fetch(url, {
        method: "GET",
        headers: {
            "x-api-key": apiKey,
            Accept: "application/json",
        },
        cache: "no-store",
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
        const message =
            body && typeof body === "object" && "error" in body
                ? String((body as { error: string }).error)
                : `HTTP ${res.status}`;
        throw new Error(message);
    }

    if (!Array.isArray(body)) {
        throw new Error("Expected array response from meeting API");
    }

    return body as ExternalMeetingListItem[];
}

async function upsertSyncedScheduled(record: ScheduledMeeting): Promise<void> {
    const pool = getPool();
    const ph = placeholders(11);
    await pool.query(
        `INSERT INTO scheduled_meetings (
          id, branch, lead_name, with_name, room_name, start_t, end_t,
          scheduled_at, date_key, confirmed, walk_in_id
        ) VALUES (${ph})
        ON DUPLICATE KEY UPDATE
          branch = VALUES(branch),
          lead_name = VALUES(lead_name),
          with_name = VALUES(with_name),
          start_t = VALUES(start_t),
          end_t = VALUES(end_t),
          scheduled_at = VALUES(scheduled_at),
          date_key = VALUES(date_key)`,
        [
            record.id,
            record.branch ?? "HBR",
            record.leadName,
            record.withName ?? null,
            record.roomName ?? null,
            record.startT,
            record.endT,
            record.scheduledAt,
            record.dateKey,
            record.confirmed ? 1 : 0,
            record.walkInId ?? null,
        ]
    );
}

/** Remove legacy CRM/Design rows that were incorrectly stored as walk-ins. */
async function removeLegacySyncedWalkIn(id: string): Promise<void> {
    const pool = getPool();
    await pool.query(
        `DELETE FROM walk_ins
         WHERE id = ? AND source IN ('crm', 'design')`,
        [id]
    );
}

/**
 * One-shot cleanup: move any remaining CRM/Design walk_ins into scheduled_meetings
 * so they stop inflating the walk-in count.
 */
async function migrateLegacySyncedWalkIns(): Promise<void> {
    const pool = getPool();
    const [rows] = await pool.query(
        `SELECT id, name, designer, schedule_time, schedule_end, arrived_at, date_key, branch
         FROM walk_ins
         WHERE source IN ('crm', 'design')`
    );
    const list = rows as Array<{
        id: string;
        name: string;
        designer: string;
        schedule_time: string | null;
        schedule_end: string | null;
        arrived_at: number;
        date_key: string;
        branch: string | null;
    }>;

    for (const row of list) {
        await upsertSyncedScheduled({
            id: row.id,
            leadName: row.name,
            withName: row.designer && row.designer !== "—" ? row.designer : undefined,
            startT: row.schedule_time?.trim() || "TBD",
            endT: row.schedule_end?.trim() || "TBD",
            scheduledAt: Number(row.arrived_at) || Date.now(),
            dateKey: row.date_key,
            confirmed: false,
            branch: row.branch ?? undefined,
        });
        await removeLegacySyncedWalkIn(row.id);
    }
}

async function syncSource(config: {
    source: MeetingSource;
    baseUrl: string;
    apiKey: string;
    path: string;
}): Promise<SyncSourceResult & { error?: string }> {
    const since = await getLastSyncedAt(config.source);
    if (!config.baseUrl || !config.apiKey) {
        return {
            source: config.source,
            fetched: 0,
            upserted: 0,
            since,
            checkpoint: since,
            error: "Missing base URL or API key",
        };
    }

    try {
        const items = await fetchRecentMeetings(
            config.baseUrl,
            config.path,
            config.apiKey,
            since
        );

        let upserted = 0;
        for (const item of items) {
            const record = externalMeetingToScheduled(config.source, item);
            await upsertSyncedScheduled(record);
            await removeLegacySyncedWalkIn(record.id);
            upserted += 1;
        }

        const checkpoint = maxIsoLocalDateTime(
            items.map((i) => i.createdAt),
            since
        );
        await setLastSyncedAt(config.source, checkpoint);

        return {
            source: config.source,
            fetched: items.length,
            upserted,
            since,
            checkpoint,
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[sync-meetings] ${config.source} failed:`, message);
        return {
            source: config.source,
            fetched: 0,
            upserted: 0,
            since,
            checkpoint: since,
            error: message,
        };
    }
}

export async function syncMeetings(): Promise<SyncMeetingsResult> {
    await ensureSchema();
    await migrateLegacySyncedWalkIns();

    const crm = await syncSource({
        source: "crm",
        baseUrl: envTrim("CRM_BASE_URL"),
        apiKey: envTrim("CRM_SHOWROOM_MEETING_API_KEY"),
        path: "/v1/Appointment/showroom-meeting-scheduled/recent",
    });

    const design = await syncSource({
        source: "design",
        baseUrl: envTrim("DESIGN_MODULE_BASE_URL"),
        apiKey:
            envTrim("DESIGN_OFFLINE_MEETING_API_KEY") ||
            envTrim("EXTERNAL_LEAD_INGEST_API_KEY"),
        path: "/v1/Appointment/offline-meeting-scheduled/recent",
    });

    return {
        ok: true,
        ranAt: new Date().toISOString(),
        crm,
        design,
    };
}
