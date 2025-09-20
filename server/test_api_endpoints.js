// Test both API endpoints directly using built-in http module
const http = require('http');

function makeRequest(path, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/public${path}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'second',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: parsedData });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

async function testEndpoints() {
  const testData = {
    pickup_address: "Salmiya, Block 1, Street 1",
    dropoff_address: "Mubarak Al-Kabeer, Block 2, St 34",
    pickup_time_utc: "2025-08-24T23:58:21.981Z"
  };
  
  console.log("=== Testing API Endpoints ===\n");
  console.log("Test data:", JSON.stringify(testData, null, 2));
  console.log("\n" + "=".repeat(50) + "\n");
  
  try {
    // Test distance endpoint
    console.log("1. Testing Distance Endpoint:");
    const distanceResponse = await makeRequest('/distance', {
      pickup_address: testData.pickup_address,
      dropoff_address: testData.dropoff_address
    });
    
    console.log("Distance Result:");
    console.log(JSON.stringify(distanceResponse.data, null, 2));
    console.log(`Distance: ${distanceResponse.data.distance_meters} meters`);
    
  } catch (error) {
    console.error("Distance endpoint error:", error.message);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
  
  try {
    // Test combined endpoint
    console.log("2. Testing Combined Endpoint:");
    const combinedResponse = await makeRequest('/combined', testData);
    
    console.log("Combined Result:");
    console.log(JSON.stringify(combinedResponse.data, null, 2));
    console.log(`Distance: ${combinedResponse.data.distance_meters} meters`);
    console.log(`ETA: ${combinedResponse.data.eta_minutes} minutes`);
    
  } catch (error) {
    console.error("Combined endpoint error:", error.message);
  }
  
  console.log("\n" + "=".repeat(50) + "\n");
  console.log("Comparison Summary:");
  console.log("Expected distance (manual calculation): 17,521.60 meters");
}

testEndpoints();
