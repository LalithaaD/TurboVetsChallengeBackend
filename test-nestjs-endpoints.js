/**
 * Test script for NestJS-style Task API Server
 * Tests all endpoints with proper NestJS response format validation
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
let authToken = '';
let userId = '';
let taskId = '';

// Test data
const testUser = {
  email: 'nestjs-test@example.com',
  username: 'nestjs-test',
  password: 'password123',
  firstName: 'NestJS',
  lastName: 'Test'
};

const testTask = {
  title: 'NestJS Test Task',
  description: 'This is a test task for the NestJS-style server',
  priority: 'high',
  isPublic: true,
  tags: ['nestjs', 'test', 'api']
};

// Helper function to make authenticated requests
const authenticatedRequest = async (method, endpoint, data = null) => {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    }
  };
  
  if (data) {
    config.data = data;
  }
  
  try {
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status || 500 
    };
  }
};

// Test functions
const testHealthCheck = async () => {
  console.log('\n🏥 Testing Health Check...');
  try {
    const response = await axios.get(BASE_URL);
    console.log('✅ Health check passed');
    console.log('   Response:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
    return false;
  }
};

const testUserRegistration = async () => {
  console.log('\n📝 Testing User Registration...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (response.status === 200 && response.data.access_token) {
      authToken = response.data.access_token;
      userId = response.data.user.id;
      console.log('✅ User registration successful');
      console.log('   Token received:', authToken.substring(0, 20) + '...');
      console.log('   User ID:', userId);
      console.log('   User role:', response.data.user.role.name);
      return true;
    } else {
      console.log('❌ Registration failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ Registration failed:', error.response?.data || error.message);
    return false;
  }
};

const testUserLogin = async () => {
  console.log('\n🔐 Testing User Login...');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    if (response.status === 200 && response.data.access_token) {
      authToken = response.data.access_token;
      console.log('✅ User login successful');
      console.log('   Token received:', authToken.substring(0, 20) + '...');
      return true;
    } else {
      console.log('❌ Login failed: Invalid response format');
      return false;
    }
  } catch (error) {
    console.log('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
};

const testGetProfile = async () => {
  console.log('\n👤 Testing Get User Profile...');
  const result = await authenticatedRequest('GET', '/auth/profile');
  
  if (result.success && result.data.id === userId) {
    console.log('✅ Profile retrieval successful');
    console.log('   User:', result.data.firstName, result.data.lastName);
    console.log('   Email:', result.data.email);
    console.log('   Role:', result.data.role.name);
    return true;
  } else {
    console.log('❌ Profile retrieval failed:', result.error);
    return false;
  }
};

const testCreateTask = async () => {
  console.log('\n📋 Testing Create Task...');
  const result = await authenticatedRequest('POST', '/tasks', testTask);
  
  if (result.success && result.status === 201 && result.data.statusCode === 201) {
    taskId = result.data.data.id;
    console.log('✅ Task creation successful');
    console.log('   Task ID:', taskId);
    console.log('   Title:', result.data.data.title);
    console.log('   Priority:', result.data.data.priority);
    console.log('   Status:', result.data.data.status);
    return true;
  } else {
    console.log('❌ Task creation failed:', result.error);
    return false;
  }
};

const testListTasks = async () => {
  console.log('\n📝 Testing List Tasks...');
  const result = await authenticatedRequest('GET', '/tasks');
  
  if (result.success && result.status === 200 && result.data.statusCode === 200) {
    const tasks = result.data.data;
    console.log('✅ Task listing successful');
    console.log('   Total tasks:', result.data.pagination.total);
    console.log('   Tasks found:', tasks.length);
    
    if (tasks.length > 0) {
      console.log('   First task:', tasks[0].title);
    }
    return true;
  } else {
    console.log('❌ Task listing failed:', result.error);
    return false;
  }
};

const testUpdateTask = async () => {
  console.log('\n✏️ Testing Update Task...');
  const updateData = {
    title: 'Updated NestJS Task',
    description: 'This task has been updated',
    status: 'in_progress',
    priority: 'medium'
  };
  
  const result = await authenticatedRequest('PUT', `/tasks/${taskId}`, updateData);
  
  if (result.success && result.status === 200 && result.data.statusCode === 200) {
    console.log('✅ Task update successful');
    console.log('   Updated title:', result.data.data.title);
    console.log('   New status:', result.data.data.status);
    console.log('   New priority:', result.data.data.priority);
    return true;
  } else {
    console.log('❌ Task update failed:', result.error);
    return false;
  }
};

const testDeleteTask = async () => {
  console.log('\n🗑️ Testing Delete Task...');
  const result = await authenticatedRequest('DELETE', `/tasks/${taskId}`);
  
  if (result.success && result.status === 200 && result.data.statusCode === 200) {
    console.log('✅ Task deletion successful');
    console.log('   Message:', result.data.message);
    return true;
  } else {
    console.log('❌ Task deletion failed:', result.error);
    return false;
  }
};

const testGetAuditLogs = async () => {
  console.log('\n📊 Testing Get Audit Logs...');
  const result = await authenticatedRequest('GET', '/tasks/audit-log');
  
  if (result.success && result.status === 200 && result.data.statusCode === 200) {
    const logs = result.data.data;
    console.log('✅ Audit logs retrieval successful');
    console.log('   Total logs:', result.data.pagination.total);
    console.log('   Logs found:', logs.length);
    
    if (logs.length > 0) {
      console.log('   Recent action:', logs[0].action, logs[0].resource);
    }
    return true;
  } else {
    console.log('❌ Audit logs retrieval failed:', result.error);
    return false;
  }
};

const testErrorHandling = async () => {
  console.log('\n🚫 Testing Error Handling...');
  
  // Test invalid token
  console.log('   Testing invalid token...');
  try {
    await axios.get(`${BASE_URL}/tasks`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    console.log('❌ Invalid token test failed: Should have returned 403');
  } catch (error) {
    if (error.response?.status === 403) {
      console.log('   ✅ Invalid token correctly rejected');
    } else {
      console.log('   ❌ Invalid token test failed:', error.response?.status);
    }
  }
  
  // Test missing token
  console.log('   Testing missing token...');
  try {
    await axios.get(`${BASE_URL}/tasks`);
    console.log('❌ Missing token test failed: Should have returned 401');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('   ✅ Missing token correctly rejected');
    } else {
      console.log('   ❌ Missing token test failed:', error.response?.status);
    }
  }
  
  // Test invalid task ID
  console.log('   Testing invalid task ID...');
  const result = await authenticatedRequest('GET', '/tasks/invalid-id');
  if (!result.success && result.status === 404) {
    console.log('   ✅ Invalid task ID correctly handled');
  } else {
    console.log('   ❌ Invalid task ID test failed');
  }
  
  return true;
};

const testPagination = async () => {
  console.log('\n📄 Testing Pagination...');
  
  // Create multiple tasks for pagination testing
  console.log('   Creating multiple tasks...');
  for (let i = 1; i <= 5; i++) {
    await authenticatedRequest('POST', '/tasks', {
      ...testTask,
      title: `Test Task ${i}`,
      description: `Description for task ${i}`
    });
  }
  
  // Test pagination
  const result = await authenticatedRequest('GET', '/tasks?page=1&limit=3');
  if (result.success && result.data.pagination) {
    const pagination = result.data.pagination;
    console.log('✅ Pagination working');
    console.log('   Page:', pagination.page);
    console.log('   Limit:', pagination.limit);
    console.log('   Total:', pagination.total);
    console.log('   Total Pages:', pagination.totalPages);
    console.log('   Tasks in response:', result.data.data.length);
    return true;
  } else {
    console.log('❌ Pagination test failed:', result.error);
    return false;
  }
};

const testFiltering = async () => {
  console.log('\n🔍 Testing Filtering...');
  
  // Test status filter
  const statusResult = await authenticatedRequest('GET', '/tasks?status=todo');
  if (statusResult.success) {
    console.log('   ✅ Status filter working');
  } else {
    console.log('   ❌ Status filter failed');
  }
  
  // Test priority filter
  const priorityResult = await authenticatedRequest('GET', '/tasks?priority=high');
  if (priorityResult.success) {
    console.log('   ✅ Priority filter working');
  } else {
    console.log('   ❌ Priority filter failed');
  }
  
  // Test search
  const searchResult = await authenticatedRequest('GET', '/tasks?search=Test');
  if (searchResult.success) {
    console.log('   ✅ Search filter working');
  } else {
    console.log('   ❌ Search filter failed');
  }
  
  return true;
};

// Main test runner
const runTests = async () => {
  console.log('🚀 Starting NestJS-style Task API Tests...');
  console.log('==========================================');
  
  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Registration', fn: testUserRegistration },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Get Profile', fn: testGetProfile },
    { name: 'Create Task', fn: testCreateTask },
    { name: 'List Tasks', fn: testListTasks },
    { name: 'Update Task', fn: testUpdateTask },
    { name: 'Get Audit Logs', fn: testGetAuditLogs },
    { name: 'Delete Task', fn: testDeleteTask },
    { name: 'Error Handling', fn: testErrorHandling },
    { name: 'Pagination', fn: testPagination },
    { name: 'Filtering', fn: testFiltering }
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${test.name} failed with error:`, error.message);
      failed++;
    }
  }
  
  console.log('\n📊 Test Results Summary');
  console.log('======================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! NestJS-style server is working perfectly!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the output above for details.');
  }
};

// Run tests
runTests().catch(console.error);
