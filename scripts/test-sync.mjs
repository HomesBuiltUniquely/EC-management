/**
 * One-shot sync test — polls CRM + Design and upserts walk_ins.
 * Usage: node scripts/test-sync.mjs
 */
import { config } from "dotenv";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

config({ path: join(root, ".env.local") });
config({ path: join(root, ".env") });

const CRM_BASE = (process.env.CRM_BASE_URL || "").replace(/\/$/, "");
const CRM_KEY = (process.env.CRM_SHOWROOM_MEETING_API_KEY || "").trim();
const DESIGN_BASE = (process.env.DESIGN_MODULE_BASE_URL || "").replace(/\/$/, "");
const DESIGN_KEY = (
  process.env.DESIGN_OFFLINE_MEETING_API_KEY ||
  process.env.EXTERNAL_LEAD_INGEST_API_KEY ||
  ""
).trim();
const SINCE = process.env.SYNC_TEST_SINCE || "2026-07-01T00:00:00";

async function probe(name, url, apiKey) {
  if (!url || !apiKey) {
    console.log(`[${name}] SKIP — missing URL or API key`);
    return null;
  }
  try {
    const res = await fetch(`${url}?since=${encodeURIComponent(SINCE)}`, {
      headers: { "x-api-key": apiKey, Accept: "application/json" },
    });
    const text = await res.text();
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    console.log(`[${name}] HTTP ${res.status}`);
    if (!res.ok) {
      console.log(`[${name}] error:`, body);
      return null;
    }
    const count = Array.isArray(body) ? body.length : 0;
    console.log(`[${name}] meetings: ${count}`);
    if (count > 0) console.log(`[${name}] sample:`, JSON.stringify(body[0], null, 2));
    return body;
  } catch (err) {
    console.log(`[${name}] FAIL —`, err instanceof Error ? err.message : err);
    console.log(`[${name}] Is the server running at ${url.split("?")[0]}?`);
    return null;
  }
}

console.log("=== API probe (since=" + SINCE + ") ===\n");
await probe(
  "CRM",
  `${CRM_BASE}/v1/Appointment/showroom-meeting-scheduled/recent`,
  CRM_KEY
);
console.log("");
await probe(
  "Design",
  `${DESIGN_BASE}/v1/Appointment/offline-meeting-scheduled/recent`,
  DESIGN_KEY
);

console.log("\n=== EC cron sync ===\n");
const cronSecret = (process.env.CRON_SECRET || "").trim();
const ecPort = process.env.EC_PORT || "3000";
if (!cronSecret) {
  console.log("CRON_SECRET not set — skip EC sync call");
  process.exit(0);
}

try {
  const res = await fetch(`http://localhost:${ecPort}/api/cron/sync-meetings`, {
    headers: { Authorization: `Bearer ${cronSecret}` },
  });
  const body = await res.json().catch(() => ({}));
  console.log(`EC sync HTTP ${res.status}`);
  console.log(JSON.stringify(body, null, 2));
} catch (err) {
  console.log("EC sync FAIL —", err instanceof Error ? err.message : err);
  console.log(`Start EC with: cd FrontandProjects/EC-management && npm run dev`);
}
