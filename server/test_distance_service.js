// Test the distance service directly
const { predictDistance } = require('./src/services/distanceService');

async function testDistanceService() {
  console.log("=== Testing Distance Service ===\n");
  
  const testData = {
    pickup_address: "Salmiya, Block 1, Street 1",
    dropoff_address: "Mubarak Al-Kabeer, Block 2, St 34"
  };
  
  try {
    const result = await predictDistance(testData);
    console.log("Distance Service Result:");
    console.log(JSON.stringify(result, null, 2));
    
    // Manual calculation for verification
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Earth's radius in meters
      const lat1Rad = lat1 * Math.PI / 180;
      const lat2Rad = lat2 * Math.PI / 180;
      const deltaLat = (lat2 - lat1) * Math.PI / 180;
      const deltaLon = (lon2 - lon1) * Math.PI / 180;
      
      const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      
      return R * c;
    };
    
    const manualDistance = calculateDistance(
      result.request.pickup.lat, result.request.pickup.lon,
      result.request.dropoff.lat, result.request.dropoff.lon
    );
    
    console.log(`\nManual calculation: ${manualDistance.toFixed(2)} meters`);
    console.log(`Service result: ${result.distance_meters} meters`);
    console.log(`Difference: ${Math.abs(manualDistance - result.distance_meters).toFixed(2)} meters`);
    
  } catch (error) {
    console.error("Error testing distance service:", error);
  }
}

testDistanceService();
