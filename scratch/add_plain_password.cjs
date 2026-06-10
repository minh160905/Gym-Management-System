const { Pool } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_AybSP4JgNG8o@ep-rough-unit-aqdr0a6f.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";
const pool = new Pool({ connectionString });

async function run() {
  try {
    console.log("Adding column...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS plain_password text;");
    console.log("Column added or already exists.");

    console.log("Updating default users...");
    await pool.query("UPDATE users SET plain_password = 'admin123' WHERE username IN ('owner', 'manager', 'trainer', 'customer');");
    console.log("Default users updated successfully.");
  } catch (err) {
    console.error("Error running query:", err);
  } finally {
    await pool.end();
  }
}

run();
