const { Client } = require('pg');

const connectionString = "postgresql://postgres.hmwyfcrgsqqzvnfntgki:vEVhxm58O5TSDFCo@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres";

async function main() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    console.log('Altering Company logo column...');
    await client.query('ALTER TABLE "Company" ALTER COLUMN "logo" TYPE TEXT;');
    console.log('Success!');
    
  } catch (err) {
    console.error('Error executing query', err.stack);
  } finally {
    await client.end();
  }
}

main();
