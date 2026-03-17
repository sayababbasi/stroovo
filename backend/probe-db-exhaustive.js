const { Client } = require('pg');

async function testConnection(url) {
    const client = new Client({ connectionString: url, connectionTimeoutMillis: 2000 });
    try {
        await client.connect();
        await client.end();
        return true;
    } catch (e) {
        if (e.message.includes('password authentication failed') || e.message.includes('SCRAM')) {
            // Password incorrect
        } else {
            console.log(`Other error for ${url}: ${e.message}`);
        }
        return false;
    }
}

async function run() {
    const passwords = ['admin_password_123', 'admin', 'postgres', 'password', '123456', 'root', 'admin123', 'postgres123', ''];
    const ports = [5432, 5433];
    const users = ['postgres', 'admin'];
    const dbs = ['work_platform', 'postgres'];

    console.log('Starting exhaustive DB probe...');

    for (const port of ports) {
        for (const user of users) {
            for (const password of passwords) {
                for (const db of dbs) {
                    const url = password
                        ? `postgresql://${user}:${password}@localhost:${port}/${db}`
                        : `postgresql://${user}@localhost:${port}/${db}`;

                    if (await testConnection(url)) {
                        console.log('!!! FOUND WORKING CONNECTION !!!');
                        console.log(`URL: ${url}`);
                        return;
                    }
                }
            }
        }
    }
    console.log('Probe finished. No connection found.');
}

run();
