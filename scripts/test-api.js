// Test script for available_places API
const testAPI = async () => {
  try {
    console.log('Testing API: /api/hotels/available_places');
    
    const response = await fetch('http://localhost:3001/api/hotels/available_places');
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`✓ Success! Found ${data.data.length} cities`);
    } else {
      console.log('✗ Failed:', data.message);
    }
    
    // Test with search query
    console.log('\nTesting with searchQuery=Chennai');
    const response2 = await fetch('http://localhost:3001/api/hotels/available_places?searchQuery=Chennai');
    const data2 = await response2.json();
    console.log('Response data:', JSON.stringify(data2, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testAPI();
