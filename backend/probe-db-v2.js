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
    const hosts = ['127.0.0.1', 'localhost', '::1'];
    const passwords = ['admin_password_123', 'admin', 'postgres', 'password', '123456', 'root', 'admin123', 'postgres123', ''];
    const ports = [5432, 5433];
    const users = ['postgres', 'admin'];
    const dbs = ['work_platform', 'postgres'];

    for (const host of hosts) {
        for (const port of ports) {
            for (const user of users) {
                for (const password of passwords) {
                    for (const db of dbs) {
                        const url = password
                            ? `postgresql://${user}:${password}@${host}:${port}/${db}`
                            : `postgresql://${user}@${host}:${port}/${db}`;

                        if (await testConnection(url)) {
                            console.log('SUCCESS_URL=' + url);
                            return;
                        }
                    }
                }
            }
        }
    }
    console.log('FAILED_ALL');
}

run();
