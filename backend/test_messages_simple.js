// Simple test for messages API without external dependencies
async function testAPI() {
  try {
    console.log('=== Testing Messages API ===');
    
    // Test health check first
    console.log('1. Testing health check...');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('Health check result:', healthData);
    
    if (healthData.status !== 'ok') {
      console.error('Server not healthy!');
      return;
    }
    
    console.log('2. Testing messages endpoint...');
    
    // Try without token first to see what error we get
    const noTokenResponse = await fetch('http://localhost:5000/api/messages');
    console.log('No token response status:', noTokenResponse.status);
    
    if (!noTokenResponse.ok) {
      const errorText = await noTokenResponse.text();
      console.log('No token error:', errorText);
    }
    
    console.log('3. Testing with fake admin token...');
    
    // Create a basic token manually (this won't work but will show us the error)
    const testToken = 'Bearer fake-token-for-testing';
    
    const tokenResponse = await fetch('http://localhost:5000/api/messages', {
      headers: {
        'Authorization': testToken,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Fake token response status:', tokenResponse.status);
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('Fake token error:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAPI();
