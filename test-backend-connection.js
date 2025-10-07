// Test script to verify backend connection
const API_BASE_URL = 'https://taxaformer-1.onrender.com';

async function testBackendConnection() {
  console.log('Testing backend connection to:', API_BASE_URL);
  
  try {
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/`);
    console.log('Health status:', healthResponse.status);
    if (healthResponse.ok) {
      const healthData = await healthResponse.text();
      console.log('Health response:', healthData);
    }
    
    // Test FASTA files endpoint
    console.log('\n2. Testing FASTA files endpoint...');
    const fastaResponse = await fetch(`${API_BASE_URL}/fasta-files`);
    console.log('FASTA files status:', fastaResponse.status);
    if (fastaResponse.ok) {
      const fastaData = await fastaResponse.json();
      console.log('FASTA files response:', JSON.stringify(fastaData, null, 2));
    } else {
      console.log('FASTA files error:', await fastaResponse.text());
    }
    
    // Test CORS headers
    console.log('\n3. Testing CORS headers...');
    console.log('Access-Control-Allow-Origin:', fastaResponse.headers.get('Access-Control-Allow-Origin'));
    console.log('Access-Control-Allow-Methods:', fastaResponse.headers.get('Access-Control-Allow-Methods'));
    
  } catch (error) {
    console.error('Connection test failed:', error);
  }
}

// Run the test
testBackendConnection();