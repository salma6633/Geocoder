#!/usr/bin/env python3
"""
Address-based ETA Prediction Script
Usage: python predict_eta_address.py "pickup_address" "dropoff_address" hour_of_day day_of_week
Example: python predict_eta_address.py "Salmiya, Block 1, Street 1" "Hawalli, Block 4, Tunis Street" 14 Wednesday
"""

import sys
import os
import lightgbm as lgb
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import numpy as np

# Add the scripts directory to the path to import geocoder
script_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(script_dir)

def enhanced_geocode(addresses):
    """
    Enhanced geocoding function using the FixedHybridGeocoder
    """
    try:
        from geocoder import FixedHybridGeocoder
        print("Loading geocoder models (this may take a moment)...")
        # Use the FixedHybridGeocoder with the correct models directory
        geocoder = FixedHybridGeocoder()
        print("Geocoder loaded successfully!")
        results = geocoder.predict_coordinates_hybrid(addresses)
        return results
    except Exception as e:
        print(f"Enhanced geocoding failed: {str(e)}")
        print("Falling back to simple geocoding...")
        return simple_geocode_fallback(addresses)

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

def main():
    if len(sys.argv) != 5:
        print("Usage: python predict_eta_address.py \"pickup_address\" \"dropoff_address\" hour_of_day day_of_week")
        print("Example: python predict_eta_address.py \"Salmiya, Block 1, Street 1\" \"Hawalli, Block 4, Tunis Street\" 14 Wednesday")
        sys.exit(1)
    
    pickup_address = sys.argv[1]
    dropoff_address = sys.argv[2]
    hour_of_day = int(sys.argv[3])
    day_of_week_input = sys.argv[4]
    
    try:
        # Use enhanced geocoding for high-accuracy results
        print("Converting addresses to coordinates using enhanced geocoding...")
        geocoding_results = enhanced_geocode([pickup_address, dropoff_address])
        
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
        
        # Load ETA model
        model_path = os.path.join(os.path.dirname(script_dir), 'models', 'eta_model.txt')
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
        
        # Predict and print result
        prediction = model.predict(input_data)[0]
        print(f"Estimated Delivery Duration: {prediction:.2f} minutes")
        
        # Print geocoding confidence warning if needed
        if pickup_result['confidence'] == 'low' or dropoff_result['confidence'] == 'low':
            print("\nWarning: One or more addresses had low geocoding confidence.")
            print("The ETA prediction may be less accurate.")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
