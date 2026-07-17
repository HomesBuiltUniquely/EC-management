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

async function primaryKeyColumns(pool: Pool, table: string): Promise<string[]> {
    const [rows] = await pool.query(
        `SELECT COLUMN_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = ?
           AND CONSTRAINT_NAME = 'PRIMARY'
         ORDER BY ORDINAL_POSITION`,
        [table]
    );
    return (rows as Array<{ COLUMN_NAME: string }>).map((row) => row.COLUMN_NAME);
}

export async function runMigrations(pool: Pool): Promise<void> {
    await addColumnIfMissing(
        pool,
        "receptionists",
        "branch",
        "`branch` VARCHAR(64) NOT NULL DEFAULT 'HBR' AFTER `name`"
    );
    await addColumnIfMissing(
        pool,
        "floor_rooms",
        "branch",
        "`branch` VARCHAR(64) NOT NULL DEFAULT 'HBR' FIRST"
    );
    await addColumnIfMissing(
        pool,
        "scheduled_meetings",
        "branch",
        "`branch` VARCHAR(64) NOT NULL DEFAULT 'HBR' AFTER `id`"
    );
    await addColumnIfMissing(
        pool,
        "completed_meetings",
        "branch",
        "`branch` VARCHAR(64) NOT NULL DEFAULT 'HBR' AFTER `id`"
    );
    await addColumnIfMissing(
        pool,
        "meeting_feedbacks",
        "branch",
        "`branch` VARCHAR(64) NOT NULL DEFAULT 'HBR' AFTER `id`"
    );

    const floorRoomPrimaryKey = await primaryKeyColumns(pool, "floor_rooms");
    if (
        floorRoomPrimaryKey.length === 1 &&
        floorRoomPrimaryKey[0] === "id"
    ) {
        await pool.query(
            "ALTER TABLE floor_rooms DROP PRIMARY KEY, ADD PRIMARY KEY (`branch`, `id`)"
        );
    }

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

    await pool.query(
        "UPDATE walk_ins SET branch = 'HBR' WHERE branch IS NULL OR TRIM(branch) = ''"
    );
    await pool.query(
        `UPDATE walk_ins
         SET branch = CASE
             WHEN LOWER(REPLACE(REPLACE(branch, ' ', ''), '-', '')) LIKE '%sarjapur%'
                 THEN 'Sarjapura'
             WHEN LOWER(REPLACE(REPLACE(branch, ' ', ''), '-', '')) LIKE '%jpnagar%'
                 THEN 'JP Nagar'
             WHEN LOWER(REPLACE(REPLACE(branch, ' ', ''), '-', '')) LIKE '%hbr%'
                 THEN 'HBR'
             ELSE branch
         END`
    );

    try {
        await pool.query(
            `CREATE INDEX idx_walk_ins_source_external ON walk_ins (source, external_appointment_id)`
        );
    } catch {
        // index may already exist
    }
    try {
        await pool.query(
            "CREATE INDEX idx_walk_ins_branch_date ON walk_ins (branch, date_key)"
        );
    } catch {
        // index may already exist
    }
}
