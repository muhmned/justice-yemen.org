const jwt = require('jsonwebtoken');

// First, let's test the health check
async function testHealthCheck() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Health check:', data);
    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Test with admin token
async function testMessagesAPI() {
  try {
    // Create a test admin token
    const adminToken = jwt.sign(
      { 
        userId: 'test-admin-id',
        username: 'admin',
        role: 'system_admin' 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    console.log('Testing with token:', adminToken);

    // Test getting messages
    const response = await fetch('http://localhost:5000/api/messages', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Messages data:', data);
    } else {
      const errorData = await response.text();
      console.error('Error response:', errorData);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

async function runTests() {
  console.log('=== Testing Messages API ===');
  
  const healthOK = await testHealthCheck();
  if (!healthOK) {
    console.log('Backend server not responding');
    return;
  }
  
  await testMessagesAPI();
}

runTests();
