# Directions API Server

A production-ready Express.js server with a modular architecture for the Directions application.

## Project Structure

```
server/
├── src/                  # Source code
│   ├── api/              # API related code
│   │   ├── controllers/  # Request handlers
│   │   ├── middlewares/  # Express middlewares
│   │   └── routes/       # API routes
│   ├── config/           # Configuration files
│   ├── models/           # Data models and ML models
│   ├── scripts/          # Python scripts and utilities
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── .env                  # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
```

## Installation

```bash
# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info

# CORS Configuration
CORS_ORIGIN=*

# Python Configuration
PYTHON_PATH=python3
MODEL_PATH=./src/models/eta_model.txt

# API Configuration
API_VERSION=v1
REQUEST_TIMEOUT=10000
```

## Usage

### Development Mode

```bash
# Start the server with nodemon for automatic reloading
npm run dev
```

### Production Mode

```bash
# Start the server
npm start
```

## API Endpoints

### GET /

Returns a welcome message.

**Response:**
```json
{
  "message": "Welcome to the Express server API",
  "version": "v1",
  "documentation": "/api/docs"
}
```

### POST /api/v1/eta

Predicts the estimated time of arrival (ETA) based on pickup and drop-off coordinates, hour of day, and day of week.

**Request Body:**
```json
{
  "pickup_lat": 29.34,
  "pickup_lon": 48.09,
  "drop_lat": 29.29,
  "drop_lon": 47.89,
  "hour_of_day": 17,
  "day_of_week": "Wednesday"
}
```

**Response:**
```json
{
  "eta_minutes": 25.5,
  "distance_km": 18.2,
  "request": {
    "pickup": {
      "lat": 29.34,
      "lon": 48.09
    },
    "dropoff": {
      "lat": 29.29,
      "lon": 47.89
    },
    "time": {
      "hour": 17,
      "day": "Wednesday"
    }
  },
  "timestamp": "2025-04-23T17:20:00.000Z"
}
```

### GET /api/v1/status

Returns the current server status.

**Response:**
```json
{
  "status": "online",
  "timestamp": "2025-04-23T17:16:00.000Z",
  "serverInfo": {
    "name": "Express API Server",
    "version": "1.0.0",
    "uptime": 3600,
    "environment": "development"
  },
  "system": {
    "platform": "linux",
    "arch": "x64",
    "nodeVersion": "v18.15.0",
    "memory": {
      "total": "16384 MB",
      "free": "8192 MB",
      "usage": "50%"
    },
    "cpu": "Intel(R) Core(TM) i7-10700K CPU @ 3.80GHz",
    "cores": 8
  }
}
```

## Error Handling

The server includes middleware for handling errors and 404 responses.

### 404 Not Found

**Response:**
```json
{
  "error": "Not Found - /invalid/path",
  "stack": "Error: Not Found - /invalid/path\n    at notFoundHandler...",
  "path": "/invalid/path"
}
```

### 500 Server Error

**Response:**
```json
{
  "error": "Something went wrong!",
  "stack": "Error: Something went wrong!\n    at...",
  "path": "/api/v1/eta"
}
```

## Development

### Linting

```bash
# Run ESLint
npm run lint
```

### Formatting

```bash
# Run Prettier
npm run format
```

### Testing

```bash
# Run tests with Jest
npm test
