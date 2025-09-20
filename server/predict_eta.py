# eta_predictor.py

import sys
import lightgbm as lgb
import pandas as pd
from sklearn.preprocessing import LabelEncoder

# Load trained model
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(script_dir, 'eta_model.txt')
model = lgb.Booster(model_file=model_path)

# Encode day of the week
day_of_week_input = sys.argv[6]
day_encoder = LabelEncoder()
import numpy as np
day_encoder.classes_ = np.array(['Friday', 'Monday', 'Saturday', 'Sunday', 'Thursday', 'Tuesday', 'Wednesday'])
day_of_week_encoded = day_encoder.transform([day_of_week_input])[0]

# Build input DataFrame
input_data = pd.DataFrame([{
    "pickup_lat": float(sys.argv[1]),
    "pickup_lon": float(sys.argv[2]),
    "drop_lat": float(sys.argv[3]),
    "drop_lon": float(sys.argv[4]),
    "hour_of_day": int(sys.argv[5]),
    "day_of_week_encoded": day_of_week_encoded
}])

# Predict and print result
prediction = model.predict(input_data)[0]
print(f"📦 Estimated Delivery Duration: {prediction:.2f} minutes")
