#!/usr/bin/env python3
"""
Enhanced ETA Prediction Script with Accurate Geocoding
Usage: python simple_eta.py pickup_lat pickup_lon drop_lat drop_lon hour_of_day day_of_week
"""

import sys
import os
import lightgbm as lgb
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import numpy as np

# Set encoding for Windows compatibility
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

# Add path for geocoder import (imported lazily when needed)
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main():
    # Load ETA model
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(os.path.dirname(script_dir), 'models', 'eta_model.txt')
    if not os.path.exists(model_path):
        # Fallback to server root directory
        model_path = os.path.join(os.path.dirname(os.path.dirname(script_dir)), 'eta_model.txt')
    
    model = lgb.Booster(model_file=model_path)
    
    if len(sys.argv) == 7:
        # Standard coordinate-based prediction
        pickup_lat = float(sys.argv[1])
        pickup_lon = float(sys.argv[2])
        drop_lat = float(sys.argv[3])
        drop_lon = float(sys.argv[4])
        hour_of_day = int(sys.argv[5])
        day_of_week_input = sys.argv[6]
        
    elif len(sys.argv) == 5:
        # Address-based prediction using enhanced geocoding
        pickup_address = sys.argv[1]
        dropoff_address = sys.argv[2]
        hour_of_day = int(sys.argv[3])
        day_of_week_input = sys.argv[4]
        
        print("Converting addresses to coordinates using enhanced geocoding...")
        
        # Import geocoder only when needed (lazy import)
        from geocoder import FixedHybridGeocoder
        
        # Initialize enhanced geocoder
        models_dir = r"C:\Users\salma\Downloads\Etijahat-main (1)\Etijahat-main\server\models"
        geocoder = FixedHybridGeocoder(models_dir=models_dir)
        
        # Convert addresses to coordinates using enhanced geocoder
        addresses = [pickup_address, dropoff_address]
        geocoding_results = geocoder.predict_coordinates_hybrid(addresses)
        
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
        
    else:
        print("Usage:")
        print("  Coordinate-based: python simple_eta.py pickup_lat pickup_lon drop_lat drop_lon hour_of_day day_of_week")
        print("  Address-based: python simple_eta.py \"pickup_address\" \"dropoff_address\" hour_of_day day_of_week")
        print("Example: python simple_eta.py \"Salmiya, Block 1, Street 1\" \"Hawalli, Block 4, Tunis Street\" 14 Wednesday")
        sys.exit(1)
    
    try:
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
        
        if len(sys.argv) == 5:
            print(f"\nNote: This uses enhanced geocoding with high accuracy.")
            if pickup_result['confidence'] == 'low' or dropoff_result['confidence'] == 'low':
                print("Warning: One or more addresses had low geocoding confidence.")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
