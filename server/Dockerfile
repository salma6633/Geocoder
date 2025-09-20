FROM python:3.12.3-slim as python-base

# Install Node.js 18
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    cmake \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Create a Python virtual environment
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHON_PATH="/opt/venv/bin/python"

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Copy Python requirements
COPY requirements.txt ./

# Install Python dependencies in the virtual environment
RUN pip3 install --upgrade pip setuptools wheel && \
    pip3 install --no-cache-dir -r requirements.txt
    
# Copy application code
COPY . .

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
