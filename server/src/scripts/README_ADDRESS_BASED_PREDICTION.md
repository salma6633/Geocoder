# Address-Based Prediction Scripts

This document describes the new address-based prediction functionality that allows users to input pickup and dropoff addresses instead of coordinates.

## Available Scripts

### 1. `simple_address_eta.py` (Recommended for current use)
A simplified address-based ETA prediction script that works without heavy dependencies.

**Usage:**
```bash
python server/src/scripts/simple_address_eta.py "pickup_address" "dropoff_address" hour_of_day day_of_week
```

**Example:**
```bash
python server/src/scripts/simple_address_eta.py "Salmiya" "Hawalli" 14 Wednesday
```

**Features:**
- Simple geocoding for major Kuwait areas
- Works with existing dependencies
- Fast and lightweight
- Provides ETA predictions in minutes

**Supported Areas:**
- Salmiya, Hawalli, Mishref, Mubarak Al-Kabeer, Salwa
- Jabriya, Bayan, Shaab, Qadsia, Kuwait City
- Sharq, Dasman, Qibla, Mirqab, Dasma
- Surra, Jleeb Al-Shuyoukh, Farwaniya, Khaitan
- Fahaheel, Ahmadi, Mangaf, Fintas, Mahboula

### 2. `predict_eta_address.py` (Full geocoder - requires additional dependencies)
Advanced address-based ETA prediction using the FixedHybridGeocoder.

**Usage:**
```bash
python server/src/scripts/predict_eta_address.py "pickup_address" "dropoff_address" hour_of_day day_of_week
```

**Requirements:**
- sentence-transformers
- torch
- Additional ML dependencies

**Features:**
- Advanced address parsing and geocoding
- High accuracy coordinate conversion
- Confidence scoring
- Detailed address component extraction

### 3. `predict_combined_address.py` (Full functionality)
Combined estimation script supporting Time, Distance, and Combined predictions.

**Usage:**
```bash
python server/src/scripts/predict_combined_address.py "pickup_address" "dropoff_address" hour_of_day day_of_week estimation_type
```

**Estimation Types:**
- `time` - Time estimation only
- `distance` - Distance estimation only  
- `combined` - Combined time and distance estimation

**Example:**
```bash
python server/src/scripts/predict_combined_address.py "Salmiya" "Hawalli" 14 Wednesday time
```

### 4. `geocoder.py` (Core geocoding module)
The main geocoding module containing the FixedHybridGeocoder class.

**Features:**
- Hybrid ML-based geocoding
- FAISS similarity search
- Address normalization and parsing
- Fallback mechanisms for reliability

## Input Format

### Address Format
Addresses can be provided in various formats:
- Simple area names: "Salmiya", "Hawalli"
- Detailed addresses: "Salmiya, Block 1, Street 1"
- Mixed format: "Hawalli, Block 4, Tunis Street"

### Parameters
- `pickup_address`: String - The pickup location
- `dropoff_address`: String - The dropoff location  
- `hour_of_day`: Integer (0-23) - Hour of the day
- `day_of_week`: String - Day name (Monday, Tuesday, etc.)
- `estimation_type`: String - Type of estimation (time/distance/combined)

## Output Format

### Simple Address ETA Output
```
Converting addresses to coordinates using simple geocoding...
Pickup: Salmiya
  -> Coordinates: (29.349200, 48.095300)
  -> Status: simple_geocoding
Dropoff: Hawalli
  -> Coordinates: (29.341300, 48.019800)
  -> Status: simple_geocoding

Estimated Delivery Duration: 30.01 minutes
```

### Full Geocoder Output
```
Converting addresses to coordinates...
Pickup: Salmiya, Block 1, Street 1
  -> Coordinates: (29.349282, 48.095322)
  -> Confidence: high
  -> Status: hybrid_predicted
Dropoff: Hawalli, Block 4, Tunis Street
  -> Coordinates: (29.341271, 48.019770)
  -> Confidence: medium
  -> Status: area_fallback

Estimated Delivery Duration: 26.70 minutes
```

## Integration with Existing API

The address-based functionality can be integrated with the existing API by:

1. **Modifying the API endpoints** to accept address parameters
2. **Adding geocoding step** before calling the prediction models
3. **Returning both coordinates and predictions** in the response

### Example API Integration

```javascript
// New endpoint structure
app.post('/api/predict-eta-address', async (req, res) => {
  const { pickup_address, dropoff_address, hour_of_day, day_of_week } = req.body;
  
  // Call the address-based prediction script
  const result = await execScript('simple_address_eta.py', [
    pickup_address, 
    dropoff_address, 
    hour_of_day, 
    day_of_week
  ]);
  
  res.json(result);
});
```

## Installation Requirements

### For Simple Address ETA (Recommended)
No additional dependencies required. Uses existing packages:
- lightgbm
- pandas
- scikit-learn
- numpy

### For Full Geocoder
Additional dependencies needed:
```bash
pip install sentence-transformers torch torchvision torchaudio faiss-cpu
```

## Performance Considerations

### Simple Address ETA
- **Speed**: Very fast (~100ms)
- **Accuracy**: Good for major areas
- **Memory**: Low memory usage
- **Dependencies**: Minimal

### Full Geocoder
- **Speed**: Moderate (~1-2 seconds)
- **Accuracy**: High precision geocoding
- **Memory**: Higher memory usage
- **Dependencies**: Heavy ML dependencies

## Error Handling

All scripts include comprehensive error handling:
- Invalid address formats
- Missing model files
- Coordinate validation
- Fallback mechanisms

## Future Enhancements

1. **Expand area coverage** in simple geocoder
2. **Add caching** for frequently used addresses
3. **Implement batch processing** for multiple addresses
4. **Add address validation** and suggestions
5. **Integrate with external geocoding APIs** as fallback

## Testing

Test the functionality with various address formats:

```bash
# Simple areas
python server/src/scripts/simple_address_eta.py "Salmiya" "Hawalli" 14 Wednesday

# Detailed addresses  
python server/src/scripts/simple_address_eta.py "Salmiya, Block 1" "Hawalli, Block 4" 14 Wednesday

# Mixed formats
python server/src/scripts/simple_address_eta.py "Kuwait City" "Fahaheel" 10 Monday
