const { Client } = require('pg');

const client = new Client({
    connectionString: 'postgresql://postgres:abbe@localhost:5432/work_management_db?schema=public'
});

async function findUsers() {
    console.log('Searching for users...');
    try {
        await client.connect();
        const res = await client.query('SELECT id, email, name, role FROM "User"');
        console.log('Users found:', res.rows);
    } catch (err) {
        console.error('Error finding users:', err);
    } finally {
        await client.end();
    }
}

findUsers();
