const { Pool } = require('pg');

async function testConnection() {
  const directUrl = "postgresql://postgres:vEVhxm58O5TSDFCo@db.hmwyfcrgsqqzvnfntgki.supabase.co:5432/postgres";
  console.log("Connecting to direct URL...");
  
  const pool = new Pool({ connectionString: directUrl });
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected successfully. Server time:', res.rows[0]);
  } catch (err) {
    console.error('Connection failed:', err.code, err.message);
  } finally {
    await pool.end();
  }
}

testConnection();
