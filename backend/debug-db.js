const { Client } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

async function probe() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });
  try {
    await client.connect();
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Project'
    `);
    console.log('PROJECT_COLUMNS_START');
    console.log(JSON.stringify(res.rows));
    console.log('PROJECT_COLUMNS_END');
  } catch (err) {
    console.error('Probe failed:', err);
  } finally {
    await client.end();
  }
}

probe();
