const { Client } = require('pg');
require('dotenv').config();

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  try {
    const res = await client.query('SELECT id, name, "tenantId", "isDeleted" FROM "Project"');
    console.log(`Found ${res.rows.length} projects:`);
    res.rows.forEach(row => {
      console.log(`- ${row.name} (ID: ${row.id}, Tenant: ${row.tenantId}, Deleted: ${row.isDeleted})`);
    });

    const userRes = await client.query("SELECT id, \"tenantId\" FROM \"User\" WHERE email = 'sayab@stroovo.com'");
    if (userRes.rows.length > 0) {
        console.log('Sayab User Details:', userRes.rows[0]);
    } else {
        console.log('Sayab user not found!');
    }

  } catch (err) {
    console.error('Error querying projects:', err);
  } finally {
    await client.end();
  }
}

main();
