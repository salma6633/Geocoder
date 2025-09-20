/**
 * Distance Prediction Service
 */
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Calculate distance between two points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} - Distance in meters
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
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

/**
 * Simple geocoding for Kuwait areas - EXACTLY matching Python implementation
 * @param {string} address - Address to geocode
 * @returns {Object} - {lat, lon} coordinates
 */
const simpleGeocode = (address) => {
  // Kuwait area coordinates mapping - EXACTLY synchronized with Python scripts
  const area_coordinates = {
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
  
  // Normalize address for lookup - EXACTLY matching Python logic
  const address_lower = address.toLowerCase();
  
  // Try to find area in address (Python logic: area in address_lower)
  for (const [area, coords] of Object.entries(area_coordinates)) {
    if (address_lower.includes(area)) {
      return coords;
    }
  }
  
  // Default to Kuwait City center if no match found
  return { lat: 29.3759, lon: 47.9774 };
};

/**
 * Get distance prediction
 * @param {Object} data - Input data for prediction
 * @param {number} [data.pickup_lat] - Pickup latitude (for coordinate-based requests)
 * @param {number} [data.pickup_lon] - Pickup longitude (for coordinate-based requests)
 * @param {number} [data.drop_lat] - Drop-off latitude (for coordinate-based requests)
 * @param {number} [data.drop_lon] - Drop-off longitude (for coordinate-based requests)
 * @param {string} [data.pickup_address] - Pickup address (for address-based requests)
 * @param {string} [data.dropoff_address] - Dropoff address (for address-based requests)
 * @returns {Promise<Object>} - Distance prediction result
 */
const predictDistance = async (data) => {
  try {
    // Validate input data
    const { pickup_lat, pickup_lon, drop_lat, drop_lon, pickup_address, dropoff_address } = data;
    
    // Check if we have either coordinate or address parameters
    const hasCoordinates = pickup_lat !== undefined && pickup_lon !== undefined && 
                          drop_lat !== undefined && drop_lon !== undefined;
    const hasAddresses = pickup_address !== undefined && dropoff_address !== undefined;
    
    if (!hasCoordinates && !hasAddresses) {
      throw new Error('Missing required location parameters for distance prediction. Provide either coordinates (pickup_lat, pickup_lon, drop_lat, drop_lon) or addresses (pickup_address, dropoff_address)');
    }
    
    let actualPickupLat, actualPickupLon, actualDropLat, actualDropLon;
    
    if (hasAddresses) {
      // Use address-based geocoding
      const pickupCoords = simpleGeocode(pickup_address);
      const dropoffCoords = simpleGeocode(dropoff_address);
      
      actualPickupLat = pickupCoords.lat;
      actualPickupLon = pickupCoords.lon;
      actualDropLat = dropoffCoords.lat;
      actualDropLon = dropoffCoords.lon;
      
      logger.debug(`Geocoded pickup address "${pickup_address}" to: ${actualPickupLat}, ${actualPickupLon}`);
      logger.debug(`Geocoded dropoff address "${dropoff_address}" to: ${actualDropLat}, ${actualDropLon}`);
    } else {
      // Use provided coordinates
      actualPickupLat = pickup_lat;
      actualPickupLon = pickup_lon;
      actualDropLat = drop_lat;
      actualDropLon = drop_lon;
    }
    
    // Calculate distance using Haversine formula
    const distanceMeters = calculateHaversineDistance(
      actualPickupLat, actualPickupLon,
      actualDropLat, actualDropLon
    );
    
    logger.debug(`Calculated distance: ${distanceMeters} meters`);
    
    // Return formatted response
    const response = {
      distance_meters: Math.round(distanceMeters * 100) / 100, // Round to 2 decimal places
      request: {
        pickup: hasAddresses ? 
          { address: pickup_address, lat: actualPickupLat, lon: actualPickupLon } :
          { lat: actualPickupLat, lon: actualPickupLon },
        dropoff: hasAddresses ? 
          { address: dropoff_address, lat: actualDropLat, lon: actualDropLon } :
          { lat: actualDropLat, lon: actualDropLon }
      },
      timestamp: new Date().toISOString()
    };
    
    return response;
  } catch (error) {
    logger.error('Distance prediction error:', error);
    throw error;
  }
};

module.exports = {
  predictDistance
};
