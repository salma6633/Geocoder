#!/usr/bin/env python3
"""
Combined Address-based Prediction Script
Supports Time Estimation, Distance Estimation, and Combined Estimation using addresses
Usage: python predict_combined_address.py "pickup_address" "dropoff_address" hour_of_day day_of_week estimation_type
Example: python predict_combined_address.py "Salmiya, Block 1, Street 1" "Hawalli, Block 4, Tunis Street" 14 Wednesday time
"""

import sys
import os
import lightgbm as lgb
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import numpy as np
import joblib
from math import radians, cos, sin, asin, sqrt

# Add the scripts directory to the path to import geocoder
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(script_dir)

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

def calculate_distance_features(pickup_lat, pickup_lon, drop_lat, drop_lon):
    """Calculate distance-related features"""
    # Import haversine_distance only when needed (lazy import)
    from geocoder import haversine_distance
    
    # Haversine distance in meters
    distance_m = haversine_distance(pickup_lat, pickup_lon, drop_lat, drop_lon)
    
    # Convert to kilometers
    distance_km = distance_m / 1000.0
    
    # Manhattan distance approximation
    lat_diff = abs(pickup_lat - drop_lat)
    lon_diff = abs(pickup_lon - drop_lon)
    manhattan_distance = lat_diff + lon_diff
    
    # Euclidean distance
    euclidean_distance = sqrt(lat_diff**2 + lon_diff**2)
    
    return {
        'distance_km': distance_km,
        'distance_m': distance_m,
        'manhattan_distance': manhattan_distance,
        'euclidean_distance': euclidean_distance,
        'lat_diff': lat_diff,
        'lon_diff': lon_diff
    }

def predict_time_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input):
    """Predict delivery time using ETA model"""
    # Load ETA model
    models_dir = os.path.join(os.path.dirname(script_dir), 'models')
    model_path = os.path.join(models_dir, 'eta_model.txt')
    if not os.path.exists(model_path):
        # Fallback to server root directory
        model_path = os.path.join(os.path.dirname(os.path.dirname(script_dir)), 'eta_model.txt')
    
    model = lgb.Booster(model_file=model_path)
    
    # Encode day of the week
    day_encoder = LabelEncoder()
    day_encoder.classes_ = np.array(['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday'])
    day_of_week_encoded = day_encoder.transform([day_of_week_input])[0]
    
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

def predict_distance_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input):
    """Predict distance using distance model"""
    try:
        # Load distance model
        models_dir = os.path.join(os.path.dirname(script_dir), 'models')
        model_path = os.path.join(models_dir, 'distance_model.pkl')
        if not os.path.exists(model_path):
            # Fallback to server root directory
            model_path = os.path.join(os.path.dirname(os.path.dirname(script_dir)), 'distance_model.pkl')
        
        model = joblib.load(model_path)
        
        # Calculate distance features
        distance_features = calculate_distance_features(pickup_lat, pickup_lon, drop_lat, drop_lon)
        
        # Encode day of the week
        day_encoder = LabelEncoder()
        day_encoder.classes_ = np.array(['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday'])
        day_of_week_encoded = day_encoder.transform([day_of_week_input])[0]
        
        # Build input DataFrame with all features that might be expected by the model
        input_data = pd.DataFrame([{
            "pickup_lat": pickup_lat,
            "pickup_lon": pickup_lon,
            "drop_lat": drop_lat,
            "drop_lon": drop_lon,
            "hour_of_day": hour_of_day,
            "day_of_week_encoded": day_of_week_encoded,
            **distance_features
        }])
        
        # Predict
        prediction = model.predict(input_data)[0]
        return prediction
        
    except Exception as e:
        # Fallback to simple haversine distance if model fails
        from geocoder import haversine_distance
        print(f"Distance model failed ({str(e)}), using haversine distance")
        return haversine_distance(pickup_lat, pickup_lon, drop_lat, drop_lon) / 1000.0  # Return in km

def predict_combined_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input):
    """Predict using combined model"""
    try:
        # Load combined model (assuming it exists)
        models_dir = os.path.join(os.path.dirname(script_dir), 'models')
        model_path = os.path.join(models_dir, 'combined_model.pkl')
        if not os.path.exists(model_path):
            # Fallback to server root directory
            model_path = os.path.join(os.path.dirname(os.path.dirname(script_dir)), 'combinedModel.py')
            if os.path.exists(model_path):
                # If combinedModel.py exists, try to use it
                import importlib.util
                spec = importlib.util.spec_from_file_location("combined_model", model_path)
                combined_module = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(combined_module)
                # This would need to be adapted based on the actual combined model structure
                raise FileNotFoundError("Combined model integration needed")
        
        model = joblib.load(model_path)
        
        # Calculate distance features
        distance_features = calculate_distance_features(pickup_lat, pickup_lon, drop_lat, drop_lon)
        
        # Encode day of the week
        day_encoder = LabelEncoder()
        day_encoder.classes_ = np.array(['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday'])
        day_of_week_encoded = day_encoder.transform([day_of_week_input])[0]
        
        # Build input DataFrame
        input_data = pd.DataFrame([{
            "pickup_lat": pickup_lat,
            "pickup_lon": pickup_lon,
            "drop_lat": drop_lat,
            "drop_lon": drop_lon,
            "hour_of_day": hour_of_day,
            "day_of_week_encoded": day_of_week_encoded,
            **distance_features
        }])
        
        # Predict
        prediction = model.predict(input_data)[0]
        return prediction
        
    except Exception as e:
        # Fallback to combining time and distance predictions
        print(f"Combined model failed ({str(e)}), using fallback combination")
        time_pred = predict_time_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input)
        distance_pred = predict_distance_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input)
        
        # Simple combination: return both as a tuple or dict
        return {
            'time_minutes': time_pred,
            'distance_km': distance_pred,
            'combined_score': time_pred * 0.6 + distance_pred * 0.4  # Weighted combination
        }

def main():
    if len(sys.argv) != 6:
        print("Usage: python predict_combined_address.py \"pickup_address\" \"dropoff_address\" hour_of_day day_of_week estimation_type")
        print("Estimation types: time, distance, combined")
        print("Example: python predict_combined_address.py \"Salmiya, Block 1, Street 1\" \"Hawalli, Block 4, Tunis Street\" 14 Wednesday time")
        sys.exit(1)
    
    pickup_address = sys.argv[1]
    dropoff_address = sys.argv[2]
    hour_of_day = int(sys.argv[3])
    day_of_week_input = sys.argv[4]
    estimation_type = sys.argv[5].lower()
    
    if estimation_type not in ['time', 'distance', 'combined']:
        print("Error: estimation_type must be 'time', 'distance', or 'combined'")
        sys.exit(1)
    
    try:
        # Import geocoder only when needed (lazy import)
        print("Converting addresses to coordinates...")
        try:
            from geocoder import FixedHybridGeocoder
            print("Loading geocoder models (this may take a moment)...")
            # Initialize geocoder with correct models directory path
            geocoder = FixedHybridGeocoder()
            print("Geocoder loaded successfully!")
            
            # Convert addresses to coordinates
            addresses = [pickup_address, dropoff_address]
            geocoding_results = geocoder.predict_coordinates_hybrid(addresses)
        except Exception as e:
            print(f"Enhanced geocoding failed: {str(e)}")
            print("Falling back to simple geocoding...")
            # Use fallback geocoding
            geocoding_results = simple_geocode_fallback([pickup_address, dropoff_address])
        
        pickup_result = geocoding_results[0]
        dropoff_result = geocoding_results[1]
        
        pickup_lat = pickup_result['latitude']
        pickup_lon = pickup_result['longitude']
        drop_lat = dropoff_result['latitude']
        drop_lon = dropoff_result['longitude']
        
        print(f"Pickup: {pickup_address}")
        print(f"  -> Coordinates: ({pickup_lat:.6f}, {pickup_lon:.6f})")
        print(f"  -> Confidence: {pickup_result['confidence']}")
        print(f"  -> Status: {pickup_result['status']}")
        
        print(f"Dropoff: {dropoff_address}")
        print(f"  -> Coordinates: ({drop_lat:.6f}, {drop_lon:.6f})")
        print(f"  -> Confidence: {dropoff_result['confidence']}")
        print(f"  -> Status: {dropoff_result['status']}")
        print()
        
        # Perform the requested estimation
        if estimation_type == 'time':
            prediction = predict_time_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input)
            print(f"Estimated Delivery Duration: {prediction:.2f} minutes")
            
        elif estimation_type == 'distance':
            prediction = predict_distance_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input)
            print(f"Estimated Distance: {prediction:.2f} km")
            
        elif estimation_type == 'combined':
            prediction = predict_combined_estimation(pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week_input)
            if isinstance(prediction, dict):
                print(f"Combined Estimation Results:")
                print(f"  Time: {prediction['time_minutes']:.2f} minutes")
                print(f"  Distance: {prediction['distance_km']:.2f} km")
                print(f"  Combined Score: {prediction['combined_score']:.2f}")
            else:
                print(f"Combined Estimation: {prediction:.2f}")
        
        # Print geocoding confidence warning if needed
        if pickup_result['confidence'] == 'low' or dropoff_result['confidence'] == 'low':
            print("\nWarning: One or more addresses had low geocoding confidence.")
            print("The prediction may be less accurate.")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
