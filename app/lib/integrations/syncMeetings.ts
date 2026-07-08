import type { WalkInRecord } from "../../Component/Type/VisitType";
import { ensureSchema, getPool } from "../mysql";
import { placeholders } from "../db/sqlHelpers";
import { externalMeetingToWalkIn } from "./normalizeMeeting";
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

async function upsertSyncedWalkIn(record: WalkInRecord): Promise<void> {
    const pool = getPool();
    const ph = placeholders(32);
    await pool.query(
        `INSERT INTO walk_ins (
          id, designer, form_date, name, email, phone, alternate_phone,
          expected_move_in, residing_address, property_name, property_address,
          property_type, property_use, budget, possession, requirements, interest,
          arrived_at, date_key, \`status\`, assigned_room_id, assigned_room_name,
          is_scheduled, schedule_time, schedule_end,
          source, external_appointment_id, lead_id, crm_name, milestone_name, branch, visit_type
        ) VALUES (${ph})
        ON DUPLICATE KEY UPDATE
          designer = VALUES(designer),
          form_date = VALUES(form_date),
          name = VALUES(name),
          date_key = VALUES(date_key),
          interest = VALUES(interest),
          arrived_at = VALUES(arrived_at),
          is_scheduled = VALUES(is_scheduled),
          schedule_time = VALUES(schedule_time),
          schedule_end = VALUES(schedule_end),
          lead_id = VALUES(lead_id),
          crm_name = VALUES(crm_name),
          milestone_name = VALUES(milestone_name),
          branch = VALUES(branch),
          visit_type = VALUES(visit_type),
          \`status\` = IF(\`status\` IN ('Assigned', 'In Discussion', 'Meeting Done'), \`status\`, VALUES(\`status\`)),
          assigned_room_id = IF(\`status\` IN ('Assigned', 'In Discussion', 'Meeting Done'), assigned_room_id, VALUES(assigned_room_id)),
          assigned_room_name = IF(\`status\` IN ('Assigned', 'In Discussion', 'Meeting Done'), assigned_room_name, VALUES(assigned_room_name))`,
        [
            record.id,
            record.designer,
            record.formDate,
            record.name,
            record.email,
            record.phone,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            record.budget,
            null,
            JSON.stringify(record.requirements),
            record.interest,
            record.arrivedAt,
            record.dateKey,
            record.status,
            null,
            null,
            record.isScheduled ? 1 : 0,
            record.scheduleTime ?? null,
            record.scheduleEnd ?? null,
            record.source ?? null,
            record.externalAppointmentId ?? null,
            record.leadId ?? null,
            record.crmName ?? null,
            record.milestoneName ?? null,
            record.branch ?? null,
            record.visitType ?? null,
        ]
    );
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
            const record = externalMeetingToWalkIn(config.source, item);
            await upsertSyncedWalkIn(record);
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
