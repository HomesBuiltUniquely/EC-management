import mysql, { type Pool, type PoolConnection, type PoolOptions } from "mysql2/promise";
import { readFileSync } from "fs";
import { join } from "path";

const globalForMysql = globalThis as unknown as {
    mysqlPool: Pool | undefined;
    mysqlSchemaReady: Promise<void> | undefined;
};

function getPoolConfig(): string | PoolOptions {
    if (process.env.DATABASE_URL) {
        return process.env.DATABASE_URL;
    }
    return {
        host: process.env.MYSQL_HOST ?? "localhost",
        port: Number(process.env.MYSQL_PORT ?? 3306),
        user: process.env.MYSQL_USER ?? "root",
        password: process.env.MYSQL_PASSWORD ?? "root@root",
        database: process.env.MYSQL_DATABASE ?? "ec_management",
        waitForConnections: true,
        connectionLimit: 10,
    };
}

export function getPool(): Pool {
    if (!globalForMysql.mysqlPool) {
        const config = getPoolConfig();
        globalForMysql.mysqlPool =
            typeof config === "string"
                ? mysql.createPool(config)
                : mysql.createPool(config);
    }
    return globalForMysql.mysqlPool;
}

async function runSchema(): Promise<void> {
    const pool = getPool();
    const schemaPath = join(process.cwd(), "app/lib/db/schema.sql");
    const sql = readFileSync(schemaPath, "utf-8");
    const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

    for (const statement of statements) {
        await pool.query(statement);
    }
}

export async function ensureSchema(): Promise<void> {
    if (!globalForMysql.mysqlSchemaReady) {
        globalForMysql.mysqlSchemaReady = runSchema();
    }
    await globalForMysql.mysqlSchemaReady;
}

export async function withTransaction<T>(
    fn: (connection: PoolConnection) => Promise<T>
): Promise<T> {
    const pool = getPool();
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const result = await fn(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}
