const { Client } = require('pg');

async function probe() {
    const passwords = ['admin123', 'abbe', 'postgres', 'password', '123456', 'admin'];
    console.log('--- PROBING ---');
    for (const p of passwords) {
        const client = new Client({ connectionString: 'postgresql://postgres:' + p + '@localhost:5432/postgres' });
        try {
            await client.connect();
            console.log('SUCCESS:' + p);
            await client.end();
            return;
        } catch (e) {
            console.log('FAILED:' + p);
        }
    }
    console.log('ALL_FAILED');
}
probe();
