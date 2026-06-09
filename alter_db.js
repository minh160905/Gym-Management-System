const { Client } = require('pg');

const connectionString = "postgresql://neondb_owner:npg_AybSP4JgNG8o@ep-rough-unit-aqdr0a6f.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";
const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("Connected to database. Altering table...");
    await client.query("ALTER TABLE classes ADD COLUMN IF NOT EXISTS end_date TEXT;");
    console.log("Table altered successfully!");
  } catch (err) {
    console.error("Error altering table:", err);
  } finally {
    await client.end();
  }
}

run();
