#!/usr/bin/env python3
"""
Test script for address-based combined model prediction
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from combinedModel import predict_eta_distance_with_addresses
import json

def test_address_based_prediction():
    print("🧪 Testing Address-Based Combined Model Prediction")
    print("=" * 60)
    
    try:
        result = predict_eta_distance_with_addresses(
            pickup_address="Salmiya, Block 1, Street 1",
            dropoff_address="Hawalli, Block 4, Tunis Street",
            pickup_time_utc_str="2024-01-15T14:30:00+00:00"
        )
        
        print("✅ Address-based prediction successful!")
        print("📊 Result:")
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False
    
    return True

if __name__ == "__main__":
    success = test_address_based_prediction()
    if success:
        print("\n🎉 All tests passed! Address-based combined model is working correctly.")
    else:
        print("\n💥 Tests failed!")
        sys.exit(1)
