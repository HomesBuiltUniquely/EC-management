/**
 * Initialize MySQL tables for EC Management.
 * Usage: npm run db:init
 */
import mysql from "mysql2/promise";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const config = process.env.DATABASE_URL
    ? process.env.DATABASE_URL
    : {
          host: process.env.MYSQL_HOST ?? "localhost",
          port: Number(process.env.MYSQL_PORT ?? 3306),
          user: process.env.MYSQL_USER ?? "root",
          password: process.env.MYSQL_PASSWORD ?? "root@root",
          multipleStatements: true,
      };

async function main() {
    const conn = await mysql.createConnection(config);

    await conn.query(
        `CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE ?? "ec_management"}`
    );
    await conn.query(
        `USE ${process.env.MYSQL_DATABASE ?? "ec_management"}`
    );

    const schemaPath = join(__dirname, "../app/lib/db/schema.sql");
    const sql = readFileSync(schemaPath, "utf-8");
    const statements = sql
        .split(";")
        .map((s) => s.trim())
        .filter(Boolean);

    for (const statement of statements) {
        await conn.query(statement);
    }

    console.log("MySQL schema ready in ec_management");
    await conn.end();
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
