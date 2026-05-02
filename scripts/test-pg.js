const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:abbe@localhost:5432/work_management_db?schema=public'
});

async function test() {
    console.log('Testing PG simple connection...');
    try {
        const res = await pool.query('SELECT NOW()');
        console.log('Connected! Result:', res.rows[0]);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        await pool.end();
    }
}

test();
