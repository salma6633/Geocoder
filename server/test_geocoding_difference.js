// Test script to identify geocoding differences between services

// JavaScript version (from distanceService.js)
const simpleGeocodeJS = (address) => {
  const kuwaitAreas = {
    'salmiya': { lat: 29.3492, lon: 48.0953 },
    'hawalli': { lat: 29.3413, lon: 48.0198 },
    'mishref': { lat: 29.2779, lon: 48.0690 },
    'mubarak al-kabeer': { lat: 29.1924, lon: 48.0774 },
    'salwa': { lat: 29.2843, lon: 48.0841 },
    'jabriya': { lat: 29.3157, lon: 48.0186 },
    'bayan': { lat: 29.3045, lon: 48.0489 },
    'shaab': { lat: 29.3654, lon: 47.9687 },
    'qadsia': { lat: 29.3012, lon: 47.9234 },
    'kuwait city': { lat: 29.3759, lon: 47.9774 },
    'sharq': { lat: 29.3759, lon: 47.9774 },
    'dasman': { lat: 29.3759, lon: 47.9774 },
    'qibla': { lat: 29.3759, lon: 47.9774 },
    'mirqab': { lat: 29.3759, lon: 47.9774 },
    'dasma': { lat: 29.3456, lon: 47.9234 },
    'surra': { lat: 29.4567, lon: 47.9234 },
    'jleeb al-shuyoukh': { lat: 29.2876, lon: 47.8234 },
    'farwaniya': { lat: 29.2876, lon: 47.9234 },
    'khaitan': { lat: 29.2876, lon: 47.8934 },
    'fahaheel': { lat: 29.0876, lon: 48.1234 },
    'ahmadi': { lat: 29.0876, lon: 48.0934 },
    'mangaf': { lat: 29.0676, lon: 48.1134 },
    'fintas': { lat: 29.1076, lon: 48.1334 },
    'mahboula': { lat: 29.1276, lon: 48.1534 },
    'zahra': { lat: 29.2803, lon: 47.9899 },
    'rawda': { lat: 29.3302, lon: 47.994 },
    'sabahiya': { lat: 29.1135, lon: 48.1123 }
  };
  
  const addressLower = address.toLowerCase().trim();
  
  // Try exact match first
  if (kuwaitAreas[addressLower]) {
    return { coords: kuwaitAreas[addressLower], match: 'exact', area: addressLower };
  }
  
  // Try partial match
  for (const [area, coords] of Object.entries(kuwaitAreas)) {
    if (area.includes(addressLower) || addressLower.includes(area)) {
      return { coords, match: 'partial', area };
    }
  }
  
  // Default to Kuwait City if no match
  return { coords: kuwaitAreas['kuwait city'], match: 'default', area: 'kuwait city' };
};

// Python version (from simple_combined_address.py)
const simpleGeocodePython = (address) => {
  const area_coordinates = {
    'salmiya': [29.3492, 48.0953],
    'hawalli': [29.3413, 48.0198],
    'mishref': [29.2779, 48.0690],
    'mubarak al-kabeer': [29.1924, 48.0774],
    'salwa': [29.2843, 48.0841],
    'jabriya': [29.3157, 48.0186],
    'bayan': [29.3045, 48.0489],
    'shaab': [29.3654, 47.9687],
    'qadsia': [29.3012, 47.9234],
    'kuwait city': [29.3759, 47.9774],
    'sharq': [29.3759, 47.9774],
    'dasman': [29.3759, 47.9774],
    'qibla': [29.3759, 47.9774],
    'mirqab': [29.3759, 47.9774],
    'dasma': [29.3456, 47.9234],
    'surra': [29.4567, 47.9234],
    'jleeb al-shuyoukh': [29.2876, 47.8234],
    'farwaniya': [29.2876, 47.9234],
    'khaitan': [29.2876, 47.8934],
    'fahaheel': [29.0876, 48.1234],
    'ahmadi': [29.0876, 48.0934],
    'mangaf': [29.0676, 48.1134],
    'fintas': [29.1076, 48.1334],
    'mahboula': [29.1276, 48.1534],
    'zahra': [29.2803, 47.9899],
    'rawda': [29.3302, 47.994],
    'sabahiya': [29.1135, 48.1123]
  };
  
  const address_lower = address.toLowerCase();
  
  // Try to find area in address (Python logic)
  for (const [area, coords] of Object.entries(area_coordinates)) {
    if (address_lower.includes(area)) {
      return { coords: { lat: coords[0], lon: coords[1] }, match: 'found', area };
    }
  }
  
  // Default to Kuwait City center if no match found
  return { coords: { lat: 29.3759, lon: 47.9774 }, match: 'fallback', area: 'kuwait_city' };
};

// Test addresses
const testAddresses = [
  "Salmiya, Block 1, Street 1",
  "Mubarak Al-Kabeer, Block 2, St 34"
];

console.log("=== Geocoding Comparison Test ===\n");

testAddresses.forEach((address, index) => {
  console.log(`Test ${index + 1}: "${address}"`);
  
  const jsResult = simpleGeocodeJS(address);
  const pythonResult = simpleGeocodePython(address);
  
  console.log(`JavaScript: ${jsResult.coords.lat}, ${jsResult.coords.lon} (${jsResult.match}: ${jsResult.area})`);
  console.log(`Python:     ${pythonResult.coords.lat}, ${pythonResult.coords.lon} (${pythonResult.match}: ${pythonResult.area})`);
  
  // Calculate distance between the two results
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
  
  if (jsResult.coords.lat !== pythonResult.coords.lat || jsResult.coords.lon !== pythonResult.coords.lon) {
    const distance = calculateDistance(
      jsResult.coords.lat, jsResult.coords.lon,
      pythonResult.coords.lat, pythonResult.coords.lon
    );
    console.log(`❌ DIFFERENCE: ${distance.toFixed(2)} meters apart`);
  } else {
    console.log(`✅ MATCH: Same coordinates`);
  }
  
  console.log("");
});
