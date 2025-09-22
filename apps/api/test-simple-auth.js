/**
 * Simple test script to verify JWT authentication endpoints
 * Run this after starting the simple server to test the authentication system
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
  console.log('🧪 Testing JWT Authentication System...\n');

  try {
    // Test 1: Register a new user
    console.log('1. Testing user registration...');
    const registerData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, registerData);
    console.log('✅ Registration successful');
    console.log('User ID:', registerResponse.data.user.id);
    console.log('Access Token:', registerResponse.data.access_token.substring(0, 50) + '...\n');

    const token = registerResponse.data.access_token;

    // Test 2: Test protected route with valid token
    console.log('2. Testing protected route with valid token...');
    const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected route access successful');
    console.log('User profile:', profileResponse.data.email, profileResponse.data.username);

    // Test 3: Test protected route without token (should fail)
    console.log('\n3. Testing protected route without token...');
    try {
      await axios.get(`${BASE_URL}/auth/profile`);
      console.log('❌ This should have failed!');
    } catch (error) {
      console.log('✅ Correctly rejected request without token');
      console.log('Status:', error.response?.status);
    }

    // Test 4: Test login with existing user
    console.log('\n4. Testing login with existing user...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful');
    console.log('New token:', loginResponse.data.access_token.substring(0, 50) + '...');

    // Test 5: Test token refresh
    console.log('\n5. Testing token refresh...');
    const refreshResponse = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Token refresh successful');
    console.log('Refreshed token:', refreshResponse.data.access_token.substring(0, 50) + '...');

    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Available endpoints:');
    console.log('- POST /auth/register - Register new user');
    console.log('- POST /auth/login - Login user');
    console.log('- GET /auth/profile - Get user profile (protected)');
    console.log('- POST /auth/refresh - Refresh token (protected)');
    console.log('- GET / - Health check');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status === 500) {
      console.error('Server error - check if database is properly set up');
    }
  }
}

// Run the test
testAuth().catch(console.error);
