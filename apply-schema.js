require('dotenv').config();
const { Pool } = require('pg');
const fs = require('fs');

async function applySchema() {
  const connectionString = process.env.DATABASE_URL.replace('?pgbouncer=true', '');
  console.log("Connecting to:", connectionString.replace(/:[^:@]+@/, ':***@'));
  
  const pool = new Pool({ connectionString });
  
  try {
    const sql = fs.readFileSync('schema.sql', 'utf8');
    console.log("Applying schema...");
    await pool.query(sql);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error('Failed to apply schema:', err.message);
  } finally {
    await pool.end();
  }
}

applySchema();
