/** Verify synced walk_ins in EC database. */
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
  user: process.env.MYSQL_USER || "root",
  password: process.env.MYSQL_PASSWORD || "Root@123",
  database: process.env.MYSQL_DATABASE || "ec_management",
});

const [rows] = await pool.query(
  `SELECT id, name, designer, visit_type, schedule_time, date_key, source, status, branch
   FROM walk_ins WHERE source IN ('crm', 'design') ORDER BY arrived_at DESC LIMIT 10`
);
console.log(JSON.stringify(rows, null, 2));
await pool.end();
