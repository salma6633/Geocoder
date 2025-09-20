# Etijahat Directions API Server

## Overview
This repository contains a production-ready Express.js server for the Etijahat Directions application, providing Estimated Time of Arrival (ETA), distance, and combined estimations for Kuwaiti locations. Developed during an internship, the system integrates a geocoding pipeline  to support both coordinate-based and address-based inputs, enabling accurate conversion of Kuwaiti addresses (e.g., area, block, street) into coordinates and predicting travel times.

## Features
- **ETA and Distance Prediction**: Estimates travel time and distance using:
  - Coordinate-based inputs (latitude/longitude).
  - Address-based inputs (e.g., "Salmiya, Block 1, Street 1") via geocoding.
- **Geocoding System**:
  - `HybridXGBFAISSGeocoder`: Combines XGBoost regression with FAISS similarity search for precise coordinate prediction.
  - Handles noisy addresses with `SentenceTransformer` embeddings and `FuzzyWuzzy`/`RapidFuzz` for entity resolution.
  - Employs `GeoHash2` for efficient geospatial encoding.
- **Visualization**: Includes Matplotlib tools to analyze geocoding across Kuwaiti regions (e.g., Hawalli, Mubarak Al-Kabeer).

## Project Structure
```
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
│   │   │   ├── predict_combined_address.py  # Address-based combined prediction
│   │   │   ├── predict_eta_address.py      # Address-based ETA prediction
│   │   │   ├── predict_eta.py             # Coordinate-based ETA prediction
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
     API_KEY=ak_62dff1692cb2ea207fe9bddd24ddd03d
     ```

## Usage
1. **Run the Server**:
   ```bash
   cd server
   npm start
   ```
   - Access at `http://localhost:3000`.

2. **Run Predictions**:
   - For address-based predictions:
     ```bash
     python server/src/scripts/predict_combined_address.py --input server/sample_input.json
     ```
   - For coordinate-based predictions:
     ```bash
     python server/src/scripts/predict_eta.py
     ```

## API Endpoints
- **GET /**: Welcome message.
  ```json
  { "message": "Welcome to the Etijahat API", "version": "v1" }
  ```
- **POST /api/v1/public/eta**: Predicts ETA, distance, or combined metrics.
  - **Coordinate-based Input**:
    ```json
    {
      "pickup_lat": 29.295167895123434,
      "pickup_lon": 47.90952491776944,
      "drop_lat": 29.3041,
      "drop_lon": 48.0764,
      "pickup_time_utc": "2025-09-20T10:52:18.970Z"
    }
    ```
    Response:
    ```json
    {
      "estimated_time": 30.99,
      "time_unit": "minutes",
      "confidence_score": 0.95,
      "request_id": "req_qfenl3y2"
    }
    ```
  - **Address-based Input**:
    ```json
    {
      "pickup_address": "Salmiya, Block 1, Street 1",
      "dropoff_address": "Mubarak Al-Kabeer, Block 2, St 34",
      "pickup_time_utc": "2025-09-20T10:52:18.971Z"
    }
    ```
    Response:
    ```json
    {
      "pickup": { "lat": 29.33, "lon": 48.07 },
      "dropoff": { "lat": 29.28, "lon": 48.05 },
      "estimated_time": 25.5,
      "distance_km": 18.2,
      "confidence_score": 0.94,
      "request_id": "req_abcd1234"
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

## 
