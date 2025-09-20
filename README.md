# Directions API Server with Kuwaiti Geocoding and ETA Prediction

## Overview
This repository hosts a production-ready Express.js server for the Directions application, integrating geocoding for Kuwaiti addresses with Estimated Time of Arrival (ETA) predictions. Developed during an internship, the system combines the `HybridXGBFAISSGeocoder` and `EnhancedXGBoostGeocoder` to convert textual addresses into coordinates and predict travel times based on location, time, and day. The solution leverages machine learning, text processing, and geospatial analysis for high accuracy and scalability.

## Features
- **Geocoding and ETA Prediction**: 
  - Converts Kuwaiti addresses (e.g., area, block, street) into coordinates and predicts ETA using a single pipeline.
  - Uses `HybridXGBFAISSGeocoder` to combine XGBoost regression with FAISS similarity search for refined coordinate predictions.
  - Employs `EnhancedXGBoostGeocoder` for multi-output regression to predict latitude/longitude.
- **Text Processing**: Handles noisy addresses with `SentenceTransformer` (`paraphrase-MiniLM-L6-v2`) embeddings and `FuzzyWuzzy` with `RapidFuzz` for entity resolution.
- **Geospatial Support**: Utilizes `GeoHash2` for efficient location encoding and proximity queries.
- **Performance**: Achieves ~240m geocoding error and optimized ETA predictions, with caching and tuned XGBoost parameters for speed.
- **Visualization**: Includes Matplotlib tools to analyze geocoding accuracy and ETA patterns across Kuwaiti regions (e.g., Hawalli, Salmiya).

## Project Structure

├── server/                       # Backend server
│   ├── src/                      # Source code
│   │   ├── api/                  # API endpoints
│   │   │   ├── controllers/      # Request handlers
│   │   │   ├── middlewares/      # Express middlewares
│   │   │   └── routes/           # API routes
│   │   ├── config/               # Configuration
│   │   ├── models/               # ML models
│   │   ├── scripts/              # Python scripts
│   │   │   ├── geocoder.py       # Geocoding and ETA logic
│   │   │   ├── predict_combined_address.py  # Combined address and ETA prediction
│   │   │   ├── predict_eta_address.py      # Address-based ETA prediction
│   │   │   ├── predict_eta.py             # ETA prediction
│   │   ├── services/             # Business logic
│   │   ├── utils/                # Utilities
│   │   ├── app.js                # Main Node.js app
│   │   ├── server.js             # Server entry point
│   ├── .env                      # Environment variables
│   ├── requirements.txt          # Python dependencies
│   ├── package.json              # Node.js dependencies
│   ├── eta_model.pkl             # ETA model
│   ├── distance_model.pkl        # Distance model
│   ├── combinedModel.py          # Combined geocoding and ETA model
├── README.md                     # This file


## Installation
1. **Clone the Repository**:
   
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
   

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

2. **Run Geocoding and ETA Prediction**:
   ```bash
   python server/src/scripts/geocoder.py
   ```
   - Processes addresses and predicts coordinates with ETA.

3. **Test Predictions**:
   ```bash
   python server/src/scripts/predict_combined_address.py --input server/sample_input.json
   ```

## API Endpoints
- **GET /**: Welcome message.
  ```json
  { "message": "Welcome to the Directions API", "version": "v1" }
  ```
- **POST /api/v1/eta**: Predicts ETA and geocodes addresses.
  ```json
  {
    "address": "Salmiya, Block 3, Street 4",
    "dropoff_address": "Hawalli, Block 1, Street 2",
    "hour_of_day": 17,
    "day_of_week": "Wednesday"
  }
  ```
  Response:
  ```json
  {
    "pickup": { "lat": 29.33, "lon": 48.07 },
    "dropoff": { "lat": 29.34, "lon": 48.09 },
    "eta_minutes": 25.5,
    "distance_km": 18.2
  }
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
