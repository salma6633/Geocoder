#!/bin/sh

# Create runtime config with environment variables from .env file
if [ -f /app/.env ]; then
  # Extract VITE_API_URL from .env file
  API_URL=$(grep VITE_API_URL /app/.env | cut -d '=' -f2)
  
  # Create config.js with the API URL
  cat > /app/dist/config.js << EOF
window.RUNTIME_CONFIG = {
  API_URL: "${API_URL:-http://localhost:3000/api}"
};
EOF
  
  echo "Runtime configuration created with API_URL: ${API_URL}"
else
  echo "Warning: No .env file found at /app/.env"
  # Create default config
  cat > /app/dist/config.js << EOF
window.RUNTIME_CONFIG = {
  API_URL: "http://localhost:3000/api"
};
EOF
fi
# Start the server
exec serve -s dist -l 3000