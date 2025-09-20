#!/usr/bin/env python3

import sys
import json
import os
import lightgbm as lgb
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import numpy as np
from datetime import datetime, timezone, timedelta
import math

# Set encoding for Windows compatibility
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

# Add path for geocoder import (imported lazily when needed)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371000  # Earth's radius in meters
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_lat / 2) ** 2 + 
         math.cos(lat1_rad) * math.cos(lat2_rad) * 
         math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c

def predict_eta_lightweight(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week):
    """Lightweight ETA prediction using LightGBM model"""
    try:
        # Load ETA model
        script_dir = os.path.dirname(os.path.abspath(__file__))
        model_path = os.path.join(os.path.dirname(script_dir), 'models', 'eta_model.txt')
        if not os.path.exists(model_path):
            # Fallback to server root directory
            model_path = os.path.join(os.path.dirname(os.path.dirname(script_dir)), 'eta_model.txt')
        
        model = lgb.Booster(model_file=model_path)
        
        # Encode day of the week
        day_encoder = LabelEncoder()
        day_encoder.classes_ = np.array(['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday'])
        day_of_week_encoded = day_encoder.transform([day_of_week])[0]
        
        # Build input DataFrame
        input_data = pd.DataFrame([{
            "pickup_lat": pickup_lat,
            "pickup_lon": pickup_lon,
            "drop_lat": drop_lat,
            "drop_lon": drop_lon,
            "hour_of_day": hour_of_day,
            "day_of_week_encoded": day_of_week_encoded
        }])
        
        # Predict
        prediction = model.predict(input_data)[0]
        return prediction
        
    except Exception as e:
        raise Exception(f"ETA prediction failed: {str(e)}")

def enhanced_geocode(addresses):
    """
    Enhanced geocoding function using the cached FixedHybridGeocoder instance
    """
    from geocoder import FixedHybridGeocoder
    # Correct path to models directory: server/models
    models_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'models')
    # Use cached instance for better performance
    geocoder = FixedHybridGeocoder.get_instance(models_dir=models_dir)
    results = geocoder.predict_coordinates_hybrid(addresses)
    return results

def simple_geocode_fallback(addresses):
    """
    Fallback geocoding function that maps known areas to approximate coordinates
    """
    # Kuwait area-to-coordinate mapping
    area_coordinates = {
        'salmiya': (29.3492, 48.0953),
        'hawalli': (29.3413, 48.0198),
        'mishref': (29.2779, 48.0690),
        'mubarak al-kabeer': (29.1924, 48.0774),
        'salwa': (29.2843, 48.0841),
        'jabriya': (29.3157, 48.0186),
        'bayan': (29.3045, 48.0489),
        'shaab': (29.3654, 47.9687),
        'qadsia': (29.3012, 47.9234),
        'kuwait city': (29.3759, 47.9774),
        'sharq': (29.3759, 47.9774),
        'dasman': (29.3759, 47.9774),
        'qibla': (29.3759, 47.9774),
        'mirqab': (29.3759, 47.9774),
        'dasma': (29.3456, 47.9234),
        'surra': (29.4567, 47.9234),
        'jleeb al-shuyoukh': (29.2876, 47.8234),
        'farwaniya': (29.2876, 47.9234),
        'khaitan': (29.2876, 47.8934),
        'fahaheel': (29.0876, 48.1234),
        'ahmadi': (29.0876, 48.0934),
        'mangaf': (29.0676, 48.1134),
        'fintas': (29.1076, 48.1334),
        'mahboula': (29.1276, 48.1534),
        'zahra': (29.2803, 47.9899),
        'rawda': (29.3302, 47.994),
        'sabahiya': (29.1135, 48.1123)
    }
    
    results = []
    for address in addresses:
        address_lower = address.lower()
        
        # Try to find area in address
        found_area = None
        found_coords = None
        for area, coords in area_coordinates.items():
            if area in address_lower:
                found_area = area
                found_coords = coords
                break
        
        # Default to Kuwait City center if no match found
        if found_coords is None:
            found_coords = (29.3759, 47.9774)
            found_area = "kuwait_city"
        
        results.append({
            'input': address,
            'parsed_area': found_area,
            'parsed_block': 'unknown',
            'parsed_street': 'unknown',
            'parsed_buildingNumber': '',
            'parsed_governorate': 'unknown',
            'latitude': found_coords[0],
            'longitude': found_coords[1],
            'status': 'fallback_geocoding',
            'confidence': 'medium'
        })
    
    return results

def predict_combined_address(pickup_address, dropoff_address, pickup_time_utc_str):
    """Combined prediction using addresses with enhanced geocoding"""
    try:
        # Use enhanced geocoding for high accuracy
        geocoding_results = enhanced_geocode([pickup_address, dropoff_address])
        
        pickup_result = geocoding_results[0]
        dropoff_result = geocoding_results[1]
        
        pickup_lat = pickup_result['latitude']
        pickup_lon = pickup_result['longitude']
        drop_lat = dropoff_result['latitude']
        drop_lon = dropoff_result['longitude']
        
        # Parse time to get day of week and hour
        pickup_time_utc = datetime.fromisoformat(pickup_time_utc_str.replace('Z', '+00:00'))
        # Convert to GCC timezone (UTC+3)
        gcc_tz = timezone(timedelta(hours=3))
        pickup_time_gcc = pickup_time_utc.astimezone(gcc_tz)
        
        day_of_week = pickup_time_gcc.strftime("%A")
        hour_of_day = pickup_time_gcc.hour
        
        # Calculate distance using Haversine formula
        distance_meters = calculate_distance(pickup_lat, pickup_lon, drop_lat, drop_lon)
        
        # Predict ETA using lightweight method
        eta_minutes = predict_eta_lightweight(
            pickup_lat, pickup_lon, drop_lat, drop_lon, 
            hour_of_day, day_of_week
        )
        
        return {
            "distance_meters": round(distance_meters, 2),
            "estimated_eta_minutes": round(eta_minutes, 2),
            "pickup_lat": pickup_lat,
            "pickup_lon": pickup_lon,
            "drop_lat": drop_lat,
            "drop_lon": drop_lon,
            "pickup_local_time": pickup_time_gcc.isoformat(),
            "day_of_week": day_of_week,
            "hour_of_day": hour_of_day,
            "geocoding": {
                "pickup": pickup_result,
                "dropoff": dropoff_result
            }
        }
        
    except Exception as e:
        raise Exception(f"Address-based prediction failed: {str(e)}")

# Check if we have the correct number of arguments
if len(sys.argv) != 4:
    print("Error: Incorrect number of arguments")
    print("Usage: python simple_combined_address.py pickup_address dropoff_address pickup_time_utc")
    sys.exit(1)

try:
    # Parse arguments
    pickup_address = sys.argv[1]
    dropoff_address = sys.argv[2]
    pickup_time_utc = sys.argv[3]  # ISO 8601 format string
    
    # Call the prediction function
    result = predict_combined_address(
        pickup_address=pickup_address,
        dropoff_address=dropoff_address,
        pickup_time_utc_str=pickup_time_utc
    )
    
    # Print the result as JSON
    print(json.dumps(result))
    
except Exception as e:
    print(f"Error during prediction: {str(e)}", file=sys.stderr)
    sys.exit(1)
