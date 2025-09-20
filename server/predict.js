const express = require("express");
const { PythonShell } = require("python-shell");
const app = express();

app.use(express.json());

app.post("/predict-eta", (req, res) => {
  const { pickup_lat, pickup_lon, drop_lat, drop_lon, hour_of_day, day_of_week } = req.body;

  if (
    pickup_lat === undefined || pickup_lon === undefined ||
    drop_lat === undefined || drop_lon === undefined ||
    hour_of_day === undefined || day_of_week === undefined
  ) {
    return res.status(400).json({ error: "Missing required input fields" });
  }

  const options = {
    mode: "text",
    pythonOptions: ["-u"],
    scriptPath: __dirname,
    args: [
      pickup_lat,
      pickup_lon,
      drop_lat,
      drop_lon,
      hour_of_day,
      day_of_week
    ]
  };

  PythonShell.run("predict_eta.py", options, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const output = results?.[0] || "Prediction error";
    res.json({ eta_minutes: parseFloat(output.match(/([\d.]+)/)?.[0] || 0) });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ETA API listening on port ${PORT}`));
