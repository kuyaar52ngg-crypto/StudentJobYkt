const { Pool } = require("pg");

async function checkPooler() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.hmwyfcrgsqqzvnfntgki:vEVhxm58O5TSDFCo@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
    ssl: { rejectUnauthorized: false }
  });
  try {
    const res = await pool.query("SELECT 1 as pooler");
    console.log("Pooler port 6543 connection SUCCESS:", res.rows);
  } catch (err) {
    console.error("Pooler port 6543 connection FAILED:", err.message);
  } finally {
    await pool.end();
  }
}

async function checkDirect() {
  const pool = new Pool({
    connectionString: "postgresql://postgres.hmwyfcrgsqqzvnfntgki:vEVhxm58O5TSDFCo@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres",
    ssl: { rejectUnauthorized: false, servername: "aws-1-ap-northeast-1.pooler.supabase.com" }
  });
  try {
    const res = await pool.query("SELECT 1 as direct");
    console.log("Direct port 5432 connection SUCCESS:", res.rows);
  } catch (err) {
    console.error("Direct port 5432 connection FAILED:", err.message);
  } finally {
    await pool.end();
  }
}

(async () => {
    await checkPooler();
    await checkDirect();
})();
