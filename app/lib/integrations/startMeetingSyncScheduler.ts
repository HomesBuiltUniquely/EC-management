import { syncMeetings } from "./syncMeetings";

const GLOBAL_KEY = "__ecMeetingSyncSchedulerStarted";

type GlobalSchedulerState = {
  [GLOBAL_KEY]?: boolean;
};

function intervalMs(): number {
    const raw = Number(process.env.MEETING_SYNC_INTERVAL_MS || 60_000);
    if (!Number.isFinite(raw) || raw < 5_000) return 60_000;
    return raw;
}

function isEnabled(): boolean {
    const flag = (process.env.MEETING_SYNC_ENABLED || "true").trim().toLowerCase();
    return flag !== "0" && flag !== "false" && flag !== "off";
}

async function runOnce(): Promise<void> {
    try {
        const result = await syncMeetings();
        const crm = result.crm;
        const design = result.design;
        console.log(
            `[meeting-sync] CRM fetched=${crm.fetched} upserted=${crm.upserted}` +
                (crm.error ? ` err=${crm.error}` : "") +
                ` | Design fetched=${design.fetched} upserted=${design.upserted}` +
                (design.error ? ` err=${design.error}` : "")
        );
    } catch (err) {
        console.error(
            "[meeting-sync] failed:",
            err instanceof Error ? err.message : err
        );
    }
}

/**
 * Starts an in-process poller (default every 1 minute) while the Next.js
 * Node server is running. Safe to call multiple times (hot reload).
 */
export function startMeetingSyncScheduler(): void {
    if (!isEnabled()) {
        console.log("[meeting-sync] disabled (MEETING_SYNC_ENABLED=false)");
        return;
    }

    const g = globalThis as typeof globalThis & GlobalSchedulerState;
    if (g[GLOBAL_KEY]) return;
    g[GLOBAL_KEY] = true;

    const ms = intervalMs();
    console.log(`[meeting-sync] scheduler started — every ${ms / 1000}s`);

    void runOnce();
    setInterval(() => {
        void runOnce();
    }, ms);
}
