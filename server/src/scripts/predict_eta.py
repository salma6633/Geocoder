#!/usr/bin/env python3
"""
Simple ETA Prediction Script
Usage: python predict_eta.py pickup_lat pickup_lon drop_lat drop_lon hour_of_day day_of_week
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

def main():
    if len(sys.argv) != 7:
        print("Usage: python predict_eta.py pickup_lat pickup_lon drop_lat drop_lon hour_of_day day_of_week")
        print("Example: python predict_eta.py 29.3759 47.9774 29.3041 48.0764 14 Monday")
        sys.exit(1)
    
    try:
        # Parse arguments
        pickup_lat = float(sys.argv[1])
        pickup_lon = float(sys.argv[2])
        drop_lat = float(sys.argv[3])
        drop_lon = float(sys.argv[4])
        hour_of_day = int(sys.argv[5])
        day_of_week_input = sys.argv[6]
        
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
        print(f"{prediction:.2f}")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
