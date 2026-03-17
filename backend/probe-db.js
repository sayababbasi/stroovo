const { Client } = require('pg');

async function testConnection(url) {
    const client = new Client({ connectionString: url, connectionTimeoutMillis: 2000 });
    try {
        await client.connect();
        await client.end();
        return true;
    } catch (e) {
        return false;
    }
}

async function run() {
    const commonPasswords = ['', 'postgres', 'admin', 'admin123', 'admin_password_123', 'postgres123', '123456', 'password', 'root'];
    const users = ['postgres', 'admin'];
    const ports = [5432, 5433];
    const dbs = ['postgres', 'work_platform'];

    for (const port of ports) {
        for (const user of users) {
            for (const password of commonPasswords) {
                for (const db of dbs) {
                    const url = password
                        ? `postgresql://${user}:${password}@localhost:${port}/${db}`
                        : `postgresql://${user}@localhost:${port}/${db}`;
                    if (await testConnection(url)) {
                        console.log('SUCCESS_URL=' + url);
                        return;
                    }
                }
            }
        }
    }
    console.log('FAILED_ALL');
}

run();
