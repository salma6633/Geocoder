# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Production stage - using a lightweight HTTP server
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install a simple HTTP server
RUN npm install -g serve

# Copy built files from build stage
COPY --from=build /app/dist /app/dist

# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

# Expose port 3000
EXPOSE 3000

# Start the server using the start script
CMD ["/app/start.sh"]
