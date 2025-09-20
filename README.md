# Directions API Server with Kuwaiti Geocoding

## Overview
This repository contains an Express.js server for the Directions application, providing estimated time of arrival (ETA) predictions and geocoding for Kuwaiti addresses. The geocoding system, developed during an internship, uses the `HybridXGBFAISSGeocoder` and `EnhancedXGBoostGeocoder` to predict latitude and longitude from address inputs, combining XGBoost regression, FAISS similarity search, and fuzzy matching for high accuracy.

## Features
- **ETA Prediction**: Estimates travel time based on pickup/drop-off coordinates, hour, and day.
- **Geocoding**: Converts Kuwaiti addresses (e.g., area, block, street) into coordinates using:
  - `HybridXGBFAISSGeocoder`: Combines XGBoost with FAISS for refined predictions.
  - `EnhancedXGBoostGeocoder`: Uses XGBoost for latitude/longitude regression.
- **Text Processing**: Handles noisy addresses with `SentenceTransformer` embeddings and `FuzzyWuzzy` matching.
- **Geospatial Support**: Uses `GeoHash2` for efficient location queries.
- **Performance**: Achieves ~240m geocoding error, optimized for speed and scalability.

## Project Structure
```
├── server/                       # Backend server
│   ├── src/                      # Source code
│   │   ├── api/                  # API endpoints
│   │   ├── config/               # Configuration
│   │   ├── models/               # ML models
│   │   ├── scripts/              # Python scripts
│   │   │   ├── geocoder.py       # Geocoding logic
│   │   │   ├── predict_*.py      # Prediction scripts
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Utilities
│   ├── .env                      # Environment variables
│   ├── requirements.txt          # Python dependencies
│   ├── package.json              # Node.js dependencies
│   ├── eta_model.pkl             # ETA model
│   ├── distance_model.pkl        # Distance model
├── README.md                     # This file
```

## Installation
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   ```

2. **Install Python Dependencies**:
   ```bash
   python -m venv server/venv
   source server/venv/bin/activate  # Linux/Mac
   server\venv\Scripts\activate     # Windows
   pip install -r server/requirements.txt
   ```

3. **Install Node.js Dependencies**:
   ```bash
   cd server
   npm install
   ```

4. **Set Up Environment**:
   - Create `server/.env`:
     ```plaintext
     PORT=3000
     NODE_ENV=development
     PYTHON_PATH=python3
     MODEL_PATH=./src/models/eta_model.pkl
     GEOCODER_MODEL_PATH=./src/models/hybrid_xgbfaiss_geocoder.pkl
     MONGO_URI=mongodb+srv://<username>:<password>@production.g8vjv.mongodb.net/
     API_VERSION=v1
     CORS_ORIGIN=*
     ```

## Usage
1. **Run the Server**:
   ```bash
   cd server
   npm start
   ```
   - Access at `http://localhost:3000`.

2. **Run Geocoding**:
   ```bash
   python server/src/scripts/geocoder.py
   ```

3. **Test Predictions**:
   ```bash
   python server/src/scripts/predict_combined_address.py --input server/sample_input.json
   ```

## API Endpoints
- **GET /**: Welcome message.
  ```json
  { "message": "Welcome to the Express server API", "version": "v1" }
  ```
- **POST /api/v1/eta**: Predicts ETA.
  ```json
  {
    "pickup_lat": 29.34, "pickup_lon": 48.09,
    "drop_lat": 29.29, "drop_lon": 47.89,
    "hour_of_day": 17, "day_of_week": "Wednesday"
  }
  ```
  Response:
  ```json
  { "eta_minutes": 25.5, "distance_km": 18.2, ... }
  ```
- **POST /api/v1/geocode**: Geocodes Kuwaiti addresses (e.g., "Hawalli, Block 1, Street 2").
  ```json
  { "address": "Salmiya, Block 3, Street 4" }
  ```
  Response:
  ```json
  { "latitude": 29.33, "longitude": 48.07, "confidence": 0.95 }
  ```
- **GET /api/v1/status**: Server status.
  ```json
  { "status": "online", "serverInfo": {...}, "system": {...} }
  ```

## Testing
```bash
cd server
npm test  # JavaScript tests
python test_address_combined.py  # Python tests
```

## Contributing
1. Fork the repository.
2. Create a branch: `git checkout -b feature/<name>`.
3. Commit changes: `git commit -m "Add feature"`.
4. Push: `git push origin feature/<name>`.
5. Open a pull request.

## License
MIT License. See [LICENSE](LICENSE) for details.
