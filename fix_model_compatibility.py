#!/usr/bin/env python3
"""
Script to fix model compatibility issues by rebuilding the hybrid model
with the current class definitions.
"""

import os
import sys
import joblib
import numpy as np
import pandas as pd
import faiss
from pathlib import Path

# Add the scripts directory to path
sys.path.append('server/src/scripts')

# Import the current geocoder classes
from geocoder import HybridXGBFAISSGeocoder, EnhancedXGBoostGeocoder, FixedHybridGeocoder

def fix_model_compatibility():
    models_dir = r"C:\Users\salma\Downloads\Etijahat-main (1)\Etijahat-main\server\models"
    
    print("🔧 Fixing model compatibility...")
    
    try:
        # Try to load the existing model
        print("📂 Loading existing model artifacts...")
        
        # Load individual components that should work
        feature_scaler = joblib.load(os.path.join(models_dir, 'feature_scaler.pkl'))
        tfidf_vectorizer = joblib.load(os.path.join(models_dir, 'tfidf_vectorizer.pkl'))
        manual_feature_columns = joblib.load(os.path.join(models_dir, 'manual_feature_columns.pkl'))
        geo_stats = joblib.load(os.path.join(models_dir, 'geo_stats.pkl'))
        
        print("✅ Basic artifacts loaded successfully")
        
        # Create a new hybrid model instance
        print("🔨 Creating new hybrid model instance...")
        hybrid_model = HybridXGBFAISSGeocoder(models_dir=models_dir)
        
        # Try to load FAISS indexes and other components
        try:
            print("📊 Loading FAISS indexes...")
            hybrid_model.load_artifacts()
            print("✅ FAISS artifacts loaded successfully")
        except Exception as e:
            print(f"⚠️ FAISS loading failed: {e}")
        
        # Try to load XGBoost models from the old pickle file
        try:
            print("🤖 Attempting to extract XGBoost models...")
            # Try different approaches to load the models
            
            # Approach 1: Try to load the old pickle with compatibility
            import pickle
            import sys
            
            # Add compatibility classes to the current module
            current_module = sys.modules[__name__]
            setattr(current_module, 'HybridXGBFAISSGeocoder', HybridXGBFAISSGeocoder)
            setattr(current_module, 'EnhancedXGBoostGeocoder', EnhancedXGBoostGeocoder)
            
            with open(os.path.join(models_dir, 'hybrid_xgbfaiss_geocoder.pkl'), 'rb') as f:
                old_model = pickle.load(f)
                
            # Extract the XGBoost models if they exist
            if hasattr(old_model, 'xgb_geocoder'):
                if hasattr(old_model.xgb_geocoder, 'lat_model') and old_model.xgb_geocoder.lat_model is not None:
                    hybrid_model.xgb_geocoder.lat_model = old_model.xgb_geocoder.lat_model
                    print("✅ Latitude model extracted")
                    
                if hasattr(old_model.xgb_geocoder, 'lon_model') and old_model.xgb_geocoder.lon_model is not None:
                    hybrid_model.xgb_geocoder.lon_model = old_model.xgb_geocoder.lon_model
                    print("✅ Longitude model extracted")
                    
        except Exception as e:
            print(f"⚠️ XGBoost model extraction failed: {e}")
            print("Will use fallback geocoding")
        
        # Save the new compatible model
        print("💾 Saving new compatible model...")
        joblib.dump(hybrid_model, os.path.join(models_dir, 'hybrid_xgbfaiss_geocoder_fixed.pkl'))
        
        # Backup the old model and replace it
        if os.path.exists(os.path.join(models_dir, 'hybrid_xgbfaiss_geocoder.pkl')):
            os.rename(
                os.path.join(models_dir, 'hybrid_xgbfaiss_geocoder.pkl'),
                os.path.join(models_dir, 'hybrid_xgbfaiss_geocoder_backup.pkl')
            )
            print("📦 Old model backed up")
        
        os.rename(
            os.path.join(models_dir, 'hybrid_xgbfaiss_geocoder_fixed.pkl'),
            os.path.join(models_dir, 'hybrid_xgbfaiss_geocoder.pkl')
        )
        
        print("✅ Model compatibility fixed!")
        print("🧪 Testing the fixed model...")
        
        # Test the fixed model
        geocoder = FixedHybridGeocoder(models_dir=models_dir)
        test_address = "Salmiya, Block 1, Street 1"
        result = geocoder.predict_coordinates_hybrid([test_address])
        
        print(f"Test result: {result[0]['latitude']:.6f}, {result[0]['longitude']:.6f}")
        print(f"Confidence: {result[0]['confidence']}")
        
        if result[0]['latitude'] != 29.375900 or result[0]['longitude'] != 47.977400:
            print("🎉 SUCCESS! Model is now working with enhanced predictions!")
        else:
            print("⚠️ Still using fallback coordinates, but model structure is fixed")
            
    except Exception as e:
        print(f"❌ Error fixing model compatibility: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_model_compatibility()
