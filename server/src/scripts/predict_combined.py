#!/usr/bin/env python3
"""
Simple Combined Prediction Script
Usage: python predict_combined.py pickup_lat pickup_lon drop_lat drop_lon pickup_time_utc
"""

import sys
import json
import os
import subprocess
from datetime import datetime, timezone, timedelta
import math

# Set encoding for Windows compatibility
if sys.platform.startswith('win'):
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.detach())

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

def predict_eta_distance(pickup_lat, pickup_lon, drop_lat, drop_lon, pickup_time_utc_str):
    """Prediction using coordinate-based ETA script and distance calculation"""
    try:
        # Parse time to get day of week and hour
        pickup_time_utc = datetime.fromisoformat(pickup_time_utc_str.replace('Z', '+00:00'))
        # Convert to GCC timezone (UTC+3)
        gcc_tz = timezone(timedelta(hours=3))
        pickup_time_gcc = pickup_time_utc.astimezone(gcc_tz)
        
        day_of_week = pickup_time_gcc.strftime("%A")
        hour_of_day = pickup_time_gcc.hour
        
        # Calculate distance using Haversine formula
        distance_meters = calculate_distance(pickup_lat, pickup_lon, drop_lat, drop_lon)
        
        # Get script directory
        script_dir = os.path.dirname(os.path.abspath(__file__))
        eta_script = os.path.join(script_dir, "predict_eta.py")
        
        # Call the ETA prediction script
        result = subprocess.run([
            sys.executable, eta_script,
            str(pickup_lat), str(pickup_lon),
            str(drop_lat), str(drop_lon),
            str(hour_of_day), day_of_week
        ], capture_output=True, text=True, encoding='utf-8')
        
        if result.returncode == 0:
            # Parse the output to get ETA
            eta_minutes = float(result.stdout.strip())
            
            return {
                "distance_meters": round(distance_meters, 2),
                "estimated_eta_minutes": round(eta_minutes, 2),
                "pickup_lat": pickup_lat,
                "pickup_lon": pickup_lon,
                "drop_lat": drop_lat,
                "drop_lon": drop_lon,
                "pickup_local_time": pickup_time_gcc.isoformat(),
                "day_of_week": day_of_week,
                "hour_of_day": hour_of_day
            }
        
        raise Exception(f"ETA script failed: {result.stderr}")
        
    except Exception as e:
        raise Exception(f"Prediction failed: {str(e)}")

def main():
    if len(sys.argv) != 6:
        print("Usage: python predict_combined.py pickup_lat pickup_lon drop_lat drop_lon pickup_time_utc")
        print("Example: python predict_combined.py 29.3759 47.9774 29.3492 48.0953 \"2024-01-15T14:30:00Z\"")
        sys.exit(1)
    
    try:
        # Parse arguments
        pickup_lat = float(sys.argv[1])
        pickup_lon = float(sys.argv[2])
        drop_lat = float(sys.argv[3])
        drop_lon = float(sys.argv[4])
        pickup_time_utc = sys.argv[5]  # ISO 8601 format string
        
        # Call the prediction function
        result = predict_eta_distance(
            pickup_lat=pickup_lat,
            pickup_lon=pickup_lon,
            drop_lat=drop_lat,
            drop_lon=drop_lon,
            pickup_time_utc_str=pickup_time_utc
        )
        
        # Print the result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(f"Error during prediction: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
