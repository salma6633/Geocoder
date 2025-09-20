#!/usr/bin/env python3

import sys
import subprocess
import os

# Get the directory of this script
current_dir = os.path.dirname(os.path.abspath(__file__))
# Path to the actual prediction script
predict_script = os.path.join(current_dir, 'server', 'predict_eta.py')

# Forward all arguments to the actual script
if len(sys.argv) < 7:
    print("Usage: python3 eta_predictor.py pickup_lat pickup_lon drop_lat drop_lon hour_of_day day_of_week")
    print("Example: python3 eta_predictor.py 29.34 48.09 29.29 47.89 17 Wednesday")
    sys.exit(1)

# Run the actual prediction script with all arguments
result = subprocess.run([sys.executable, predict_script] + sys.argv[1:], 
                        capture_output=True, text=True)

# Print the output
print(result.stdout)

# If there was an error, print it
if result.stderr:
    print("Error:", result.stderr)
    sys.exit(1)
