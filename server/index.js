const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ETA prediction endpoint
app.post('/api/eta', (req, res) => {
  const { pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week } = req.body;

  if (
    pickup_lat === undefined || pickup_lon === undefined ||
    drop_lat === undefined || drop_lon === undefined ||
    hour_of_day === undefined || day_of_week === undefined
  ) {
    return res.status(400).json({
      error: 'Missing required parameters',
      required: {
        pickup_lat: 'number',
        pickup_lon: 'number',
        drop_lat: 'number',
        drop_lon: 'number',
        hour_of_day: 'number',
        day_of_week: 'string (e.g., "Monday")'
      }
    });
  }

  // Construct the command to run the Python script
  const scriptPath = path.join(__dirname, 'predict_eta.py');
  const command = `python3 "${scriptPath}" ${pickup_lat} ${pickup_lon} ${drop_lat} ${drop_lon} ${hour_of_day} "${day_of_week}"`;
  
  console.log(`Executing command: ${command}`);
  
  // Set a timeout of 10 seconds
  exec(command, { timeout: 10000 }, (err, stdout, stderr) => {
    if (err) {
      console.error('Execution error:', err);
      return res.status(500).json({ 
        error: 'Prediction failed', 
        details: err.message,
        stderr: stderr
      });
    }
    
    if (stderr) {
      console.error('Python stderr:', stderr);
    }
    
    if (!stdout) {
      return res.status(500).json({ error: 'No prediction result returned' });
    }
    
    console.log('Python stdout:', stdout);
    
    // Extract the numeric value from the formatted output
    // Expected format: "📦 Estimated Delivery Duration: 41.95 minutes"
    const match = stdout.match(/(\d+\.\d+)/);
    
    if (!match) {
      console.error('Could not parse prediction result:', stdout);
      return res.status(500).json({ 
        error: 'Invalid prediction result format', 
        raw_output: stdout 
      });
    }
    
    const eta = parseFloat(match[1]);
    if (isNaN(eta)) {
      return res.status(500).json({ error: 'Invalid prediction result' });
    }

    res.json({
      eta_minutes: eta,
      received: req.body,
      timestamp: new Date()
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
