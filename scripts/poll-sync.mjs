/**
 * Local testing poller — hits EC sync cron every N seconds (default 60).
 *
 * Usage:
 *   npm run sync:poll
 *   SYNC_POLL_INTERVAL_MS=30000 npm run sync:poll
 *
 * Stop with Ctrl+C. Keep `npm run dev` running in another terminal.
 */
const INTERVAL_MS = Number(process.env.SYNC_POLL_INTERVAL_MS || 60_000);
const EC_PORT = process.env.EC_PORT || "3000";
const CRON_SECRET = (process.env.CRON_SECRET || "").trim();
const URL = `http://localhost:${EC_PORT}/api/cron/sync-meetings`;

if (!CRON_SECRET) {
  console.error("CRON_SECRET is missing. Add it to .env.local and restart.");
  process.exit(1);
}

if (!Number.isFinite(INTERVAL_MS) || INTERVAL_MS < 5_000) {
  console.error("SYNC_POLL_INTERVAL_MS must be at least 5000");
  process.exit(1);
}

async function runOnce() {
  const at = new Date().toLocaleTimeString();
  try {
    const res = await fetch(URL, {
      headers: { Authorization: `Bearer ${CRON_SECRET}`, Accept: "application/json" },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.log(`[${at}] HTTP ${res.status}`, body);
      return;
    }
    const crm = body.crm ?? {};
    const design = body.design ?? {};
    console.log(
      `[${at}] ok — CRM fetched=${crm.fetched ?? "?"} upserted=${crm.upserted ?? "?"}` +
        (crm.error ? ` err=${crm.error}` : "") +
        ` | Design fetched=${design.fetched ?? "?"} upserted=${design.upserted ?? "?"}` +
        (design.error ? ` err=${design.error}` : "")
    );
  } catch (err) {
    console.log(
      `[${at}] FAIL —`,
      err instanceof Error ? err.message : err,
      `(Is EC running on :${EC_PORT}?)`
    );
  }
}

console.log(`Polling ${URL} every ${INTERVAL_MS / 1000}s (Ctrl+C to stop)\n`);
await runOnce();
setInterval(runOnce, INTERVAL_MS);
