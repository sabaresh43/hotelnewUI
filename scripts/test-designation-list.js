// Test script to verify designation list fix
const testDesignationList = async () => {
  try {
    console.log('=== Testing Designation List API ===\n');
    
    // Test 1: Get all destinations
    console.log('Test 1: Fetch all destinations');
    const response1 = await fetch('http://localhost:3002/api/hotels/available_places');
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', JSON.stringify(data1, null, 2));
    console.log(data1.success ? `✓ Success! Found ${data1.data.length} cities\n` : `✗ Failed: ${data1.message}\n`);
    
    // Test 2: Search for "Chennai" using the "q" parameter
    console.log('Test 2: Search for "Chennai" using ?q=Chennai');
    const response2 = await fetch('http://localhost:3002/api/hotels/available_places?q=Chennai');
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', JSON.stringify(data2, null, 2));
    console.log(data2.success && data2.data.length > 0 ? `✓ Success! Found ${data2.data.length} matching cities\n` : `✗ Failed or no results\n`);
    
    // Test 3: Search for "Del"
    console.log('Test 3: Search for "Del" using ?q=Del');
    const response3 = await fetch('http://localhost:3002/api/hotels/available_places?q=Del');
    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', JSON.stringify(data3, null, 2));
    console.log(data3.success && data3.data.length > 0 ? `✓ Success! Found ${data3.data.length} matching cities\n` : `✗ Failed or no results\n`);
    
    console.log('=== All Tests Complete ===');
    
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
};

testDesignationList();
