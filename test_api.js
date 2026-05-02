const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/projects',
  method: 'GET',
  headers: {
    'x-user-id': 'cmoftkvy80000l8exg7x5phqa', // Sayab's User ID
    'x-tenant-id': 'stroovo-hq'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`STATUS: ${res.statusCode}`);
    console.log(`BODY: ${data}`);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
