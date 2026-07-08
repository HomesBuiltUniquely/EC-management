import type { Pool } from "mysql2/promise";

async function columnExists(
    pool: Pool,
    table: string,
    column: string
): Promise<boolean> {
    const [rows] = await pool.query(
        `SELECT 1 FROM information_schema.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?
         LIMIT 1`,
        [table, column]
    );
    return (rows as unknown[]).length > 0;
}

async function addColumnIfMissing(
    pool: Pool,
    table: string,
    column: string,
    definition: string
): Promise<void> {
    if (await columnExists(pool, table, column)) return;
    await pool.query(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
}

export async function runMigrations(pool: Pool): Promise<void> {
    await addColumnIfMissing(pool, "walk_ins", "source", "`source` VARCHAR(32) NULL");
    await addColumnIfMissing(
        pool,
        "walk_ins",
        "external_appointment_id",
        "`external_appointment_id` BIGINT NULL"
    );
    await addColumnIfMissing(pool, "walk_ins", "lead_id", "`lead_id` VARCHAR(64) NULL");
    await addColumnIfMissing(pool, "walk_ins", "crm_name", "`crm_name` VARCHAR(255) NULL");
    await addColumnIfMissing(
        pool,
        "walk_ins",
        "milestone_name",
        "`milestone_name` VARCHAR(100) NULL"
    );
    await addColumnIfMissing(pool, "walk_ins", "branch", "`branch` VARCHAR(64) NULL");
    await addColumnIfMissing(pool, "walk_ins", "visit_type", "`visit_type` VARCHAR(64) NULL");

    await pool.query(`
        CREATE TABLE IF NOT EXISTS integration_sync_state (
            source VARCHAR(32) PRIMARY KEY,
            last_synced_at VARCHAR(32) NOT NULL,
            updated_at BIGINT NOT NULL
        )
    `);

    try {
        await pool.query(
            `CREATE INDEX idx_walk_ins_source_external ON walk_ins (source, external_appointment_id)`
        );
    } catch {
        // index may already exist
    }
}
