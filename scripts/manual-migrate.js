const { Client } = require('pg');

async function migrate() {
  const connectionString = "postgresql://postgres.hmwyfcrgsqqzvnfntgki:vEVhxm58O5TSDFCo@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    console.log("Adding logo to Company...");
    try {
      await client.query('ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "logo" TEXT;');
    } catch (e) { console.error("Error adding logo:", e.message); }

    console.log("Adding isVerified to Company...");
    try {
      await client.query('ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN DEFAULT false;');
    } catch (e) { console.error("Error adding isVerified:", e.message); }

    console.log("Adding avatarUrl to User...");
    try {
      await client.query('ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;');
    } catch (e) { console.error("Error adding avatarUrl:", e.message); }

    console.log("Migration complete!");
  } catch (err) {
    console.error("Connection error:", err.stack);
  } finally {
    await client.end();
  }
}

migrate();
