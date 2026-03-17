const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function fix() {
    const client = new Client({ connectionString: 'postgresql://postgres:abbe@localhost:5432/work_management_db' });
    try {
        await client.connect();
        console.log('CONNECTED');

        const hash = await bcrypt.hash('admin', 10);
        const res = await client.query('UPDATE "User" SET password = $1 WHERE email = $2', [hash, 'admin@workflow.com']);
        console.log('UPDATE_ADMIN:' + res.rowCount);

        const pmHash = await bcrypt.hash('pm_password_123', 10);
        await client.query('UPDATE "User" SET password = $1 WHERE email = $2', [pmHash, 'pm@workflow.com']);

        const devHash = await bcrypt.hash('dev_password_123', 10);
        await client.query('UPDATE "User" SET password = $1 WHERE email = $2', [devHash, 'dev@workflow.com']);

        console.log('ALL_DONE');
    } catch (e) {
        console.error('ERROR:' + e.message);
    } finally {
        await client.end();
    }
}
fix();
