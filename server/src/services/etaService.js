/**
 * ETA Prediction Service
 */
const path = require('path');
const config = require('../config');
const logger = require('../utils/logger');
const moment = require('moment-timezone');

/**
 * Get ETA prediction from model
 * @param {Object} data - Input data for prediction
 * @param {number} [data.pickup_lat] - Pickup latitude (for coordinate-based requests)
 * @param {number} [data.pickup_lon] - Pickup longitude (for coordinate-based requests)
 * @param {number} [data.drop_lat] - Drop-off latitude (for coordinate-based requests)
 * @param {number} [data.drop_lon] - Drop-off longitude (for coordinate-based requests)
 * @param {string} [data.pickup_address] - Pickup address (for address-based requests)
 * @param {string} [data.dropoff_address] - Dropoff address (for address-based requests)
 * @param {string} data.pickup_time_utc - Pickup time in UTC (ISO 8601 format)
 * @returns {Promise<Object>} - ETA prediction result
 */
const predictETA = async (data) => {
  try {
    // Validate input data
    const { pickup_lat, pickup_lon, drop_lat, drop_lon, pickup_address, dropoff_address, pickup_time_utc, hour_of_day, day_of_week } = data;
    
    // Check if we have either coordinate or address parameters
    const hasCoordinates = pickup_lat !== undefined && pickup_lon !== undefined && 
                          drop_lat !== undefined && drop_lon !== undefined;
    const hasAddresses = pickup_address !== undefined && dropoff_address !== undefined;
    
    if (!hasCoordinates && !hasAddresses) {
      throw new Error('Missing required location parameters for ETA prediction. Provide either coordinates (pickup_lat, pickup_lon, drop_lat, drop_lon) or addresses (pickup_address, dropoff_address)');
    }
    
    // Determine time parameters based on input
    let kuwaitTime;
    let hourOfDay;
    let dayOfWeek;
    
    // If pickup_time_utc is provided, use it to calculate Kuwait time
    if (pickup_time_utc) {
      try {
        // Try to extract date components directly if moment parsing fails
        let kuwaitDate;
        
        try {
          // First attempt: Try standard moment parsing
          const parsedDate = moment(pickup_time_utc);
          
          if (parsedDate.isValid()) {
            // Convert UTC time to Kuwait time (GMT+3)
            kuwaitDate = parsedDate.tz('Asia/Kuwait');
          } else {
            throw new Error('Invalid date format');
          }
        } catch (parseError) {
          // Second attempt: Try manual parsing if standard parsing fails
          logger.warn(`Standard date parsing failed: ${parseError.message}. Attempting manual parsing.`);
          
          // Extract date components using regex
          // This regex matches ISO 8601 format with some flexibility
          const dateRegex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/;
          const match = pickup_time_utc.match(dateRegex);
          
          if (match) {
            // Extract components: year, month, day, hour, minute, second
            const [_, year, month, day, hour, minute, second] = match;
            
            // Create a new date with extracted components
            // Note: month is 0-indexed in JavaScript Date
            const extractedDate = new Date(Date.UTC(
              parseInt(year.slice(-4)), // Take last 4 digits if year is too long
              parseInt(month) - 1,
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second)
            ));
            
            // Convert to moment and set timezone
            kuwaitDate = moment(extractedDate).tz('Asia/Kuwait');
            
            if (!kuwaitDate.isValid()) {
              throw new Error('Manual date parsing failed');
            }
            
            logger.debug('Successfully parsed date manually');
          } else {
            throw new Error('Could not extract date components from string');
          }
        }
        
        // Extract hour of day (0-23) and day of week
        hourOfDay = kuwaitDate.hour();
        
        // Returns full day name (e.g., "Monday")
        dayOfWeek = kuwaitDate.format('dddd');
        
        logger.debug(`Converted UTC time to Kuwait time: ${kuwaitDate.format()}`);
        logger.debug(`Extracted hour: ${hourOfDay}, day: ${dayOfWeek}`);
      } catch (error) {
        logger.error(`Error processing pickup_time_utc: ${error.message}`);
        throw new Error(`Invalid pickup_time_utc parameter: ${error.message}`);
      }
    } 
    // For backward compatibility, use hour_of_day and day_of_week if provided
    else if (hour_of_day !== undefined && day_of_week !== undefined) {
      hourOfDay = hour_of_day;
      dayOfWeek = day_of_week;
    } 
    // If neither time format is provided, throw an error
    else {
      throw new Error('Missing time parameters: either pickup_time_utc or (hour_of_day and day_of_week) must be provided');
    }

    // Use direct child_process execution
    const { execFile } = require('child_process');
    let scriptPath, scriptArgs, actualPickupLat, actualPickupLon, actualDropLat, actualDropLon;
    
    if (hasAddresses) {
      // Use simple address-based prediction script for ETA
      scriptPath = path.join(__dirname, '../scripts/simple_combined_address.py');
      scriptArgs = [scriptPath, pickup_address, dropoff_address, pickup_time_utc];
      logger.debug(`Running address-based ETA prediction script: ${scriptPath}`);
    } else {
      // Use coordinate-based prediction script
      scriptPath = path.join(__dirname, '../scripts/predict_eta.py');
      scriptArgs = [
        scriptPath,
        pickup_lat.toString(),
        pickup_lon.toString(),
        drop_lat.toString(),
        drop_lon.toString(),
        hourOfDay.toString(),
        dayOfWeek
      ];
      actualPickupLat = pickup_lat;
      actualPickupLon = pickup_lon;
      actualDropLat = drop_lat;
      actualDropLon = drop_lon;
      logger.debug(`Running coordinate-based ETA prediction script: ${scriptPath}`);
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

    let eta, predictionResult;
    
    if (hasAddresses) {
      // Parse JSON response from address-based script
      try {
        predictionResult = JSON.parse(results);
        eta = predictionResult.estimated_eta_minutes;
        actualPickupLat = predictionResult.pickup_lat;
        actualPickupLon = predictionResult.pickup_lon;
        actualDropLat = predictionResult.drop_lat;
        actualDropLon = predictionResult.drop_lon;
      } catch (parseError) {
        logger.error('Error parsing address-based prediction result:', parseError);
        throw new Error(`Invalid prediction result format: ${parseError.message}`);
      }
    } else {
      // Parse text response from coordinate-based script
      const output = results;
      logger.debug(`Python script output: ${output}`);

      // Extract the numeric value from the formatted output
      // Expected format: "Estimated Delivery Duration: 41.95 minutes"
      const match = output.match(/(\d+\.\d+)/);
      
      if (!match) {
        logger.error('Could not parse prediction result:', output);
        throw new Error('Invalid prediction result format');
      }
      
      eta = parseFloat(match[1]);
    }
    
    if (isNaN(eta)) {
      throw new Error('Invalid prediction result');
    }

    // Return formatted response with the model's prediction
    const response = {
      eta_minutes: eta,
      request: {
        pickup: hasAddresses ? 
          { address: pickup_address, lat: actualPickupLat, lon: actualPickupLon } :
          { lat: actualPickupLat, lon: actualPickupLon },
        dropoff: hasAddresses ? 
          { address: dropoff_address, lat: actualDropLat, lon: actualDropLon } :
          { lat: actualDropLat, lon: actualDropLon },
        time: {
          hour: hourOfDay,
          day: dayOfWeek,
          pickup_time_utc: pickup_time_utc
        }
      },
      timestamp: new Date().toISOString()
    };
    
    return response;
  } catch (error) {
    logger.error('ETA prediction error:', error);
    throw error;
  }
};

module.exports = {
  predictETA
};
