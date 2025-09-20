/**
 * Combined Prediction Service
 * Provides distance and ETA predictions using the combined model
 */
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const moment = require('moment-timezone');

/**
 * Get combined distance and ETA prediction from model
 * @param {Object} data - Input data for prediction
 * @param {number} [data.pickup_lat] - Pickup latitude (for coordinate-based requests)
 * @param {number} [data.pickup_lon] - Pickup longitude (for coordinate-based requests)
 * @param {number} [data.drop_lat] - Drop-off latitude (for coordinate-based requests)
 * @param {number} [data.drop_lon] - Drop-off longitude (for coordinate-based requests)
 * @param {string} [data.pickup_address] - Pickup address (for address-based requests)
 * @param {string} [data.dropoff_address] - Dropoff address (for address-based requests)
 * @param {string} data.pickup_time_utc - Pickup time in UTC (ISO 8601 format)
 * @returns {Promise<Object>} - Combined prediction result with distance and ETA
 */
const predictCombined = async (data) => {
  try {
    // Validate input data
    const { pickup_lat, pickup_lon, drop_lat, drop_lon, pickup_address, dropoff_address, pickup_time_utc } = data;
    
    // Check if we have either coordinate or address parameters
    const hasCoordinates = pickup_lat !== undefined && pickup_lon !== undefined && 
                          drop_lat !== undefined && drop_lon !== undefined;
    const hasAddresses = pickup_address !== undefined && dropoff_address !== undefined;
    
    if (!hasCoordinates && !hasAddresses) {
      throw new Error('Missing required location parameters for combined prediction. Provide either coordinates (pickup_lat, pickup_lon, drop_lat, drop_lon) or addresses (pickup_address, dropoff_address)');
    }
    
    // Check if pickup_time_utc is provided
    if (!pickup_time_utc) {
      throw new Error('Missing pickup_time_utc parameter for combined prediction');
    }

    // Use direct child_process execution
    const { execFile } = require('child_process');
    let scriptPath, scriptArgs;
    
    if (hasAddresses) {
      // Use simple address-based prediction script
      scriptPath = path.join(__dirname, '../scripts/simple_combined_address.py');
      scriptArgs = [scriptPath, pickup_address, dropoff_address, pickup_time_utc];
      logger.debug(`Running simple address-based combined prediction script: ${scriptPath}`);
    } else {
      // Use coordinate-based prediction script
      scriptPath = path.join(__dirname, '../scripts/predict_combined.py');
      scriptArgs = [
        scriptPath,
        pickup_lat.toString(),
        pickup_lon.toString(),
        drop_lat.toString(),
        drop_lon.toString(),
        pickup_time_utc
      ];
      logger.debug(`Running coordinate-based combined prediction script: ${scriptPath}`);
    }
    
    // Run Python script with model
    const results = await new Promise((resolve, reject) => {
      execFile(
        config.pythonPath, 
        scriptArgs, 
        { timeout: config.requestTimeout || 60000 },
        (err, stdout, stderr) => {
          if (err) {
            logger.error('Python script execution error:', err);
            logger.error('Python stderr:', stderr);
            return reject(err);
          }
          
          if (stderr) {
            logger.warn('Python stderr (non-fatal):', stderr);
          }
          
          logger.debug('Python stdout:', stdout);
          resolve(stdout.trim());
        }
      );
    });

    // Parse the result
    if (!results) {
      throw new Error('No prediction result returned');
    }

    try {
      // Parse the JSON output from the Python script
      const predictionResult = JSON.parse(results);
      
      // Return formatted response with the model's prediction
      const response = {
        distance_meters: predictionResult.distance_meters,
        eta_minutes: predictionResult.estimated_eta_minutes,
        request: {
          pickup: hasAddresses ? 
            { address: pickup_address, lat: predictionResult.pickup_lat, lon: predictionResult.pickup_lon } :
            { lat: pickup_lat, lon: pickup_lon },
          dropoff: hasAddresses ? 
            { address: dropoff_address, lat: predictionResult.drop_lat, lon: predictionResult.drop_lon } :
            { lat: drop_lat, lon: drop_lon },
          time: {
            pickup_time_utc: pickup_time_utc,
            pickup_local_time: predictionResult.pickup_local_time,
            day_of_week: predictionResult.day_of_week,
            hour_of_day: predictionResult.hour_of_day
          }
        },
        timestamp: new Date().toISOString()
      };
      
      return response;
    } catch (parseError) {
      logger.error('Error parsing prediction result:', parseError);
      throw new Error(`Invalid prediction result format: ${parseError.message}`);
    }
  } catch (error) {
    logger.error('Combined prediction error:', error);
    throw error;
  }
};

module.exports = {
  predictCombined
};
