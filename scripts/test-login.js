const axios = require('axios');

async function testLogin() {
  console.log('Testing Login API at http://localhost:3000/api/auth/login...');
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'ceo@revoticai.com',
      password: 'ceo@1234'
    }, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('STATUS:', response.status);
    console.log('BODY:', JSON.stringify(response.data, null, 2));
    console.log('COOKIES:', response.headers['set-cookie']);
    
    if (response.status === 200) {
      console.log('✅ LOGIN SUCCESS');
    } else {
      console.log('❌ LOGIN FAILED');
    }
  } catch (error) {
    if (error.response) {
      console.log('❌ STATUS:', error.response.status);
      console.log('❌ ERROR DATA:', error.response.data);
    } else {
      console.error('❌ REQUEST ERROR:', error.message);
    }
  }
}

testLogin();
