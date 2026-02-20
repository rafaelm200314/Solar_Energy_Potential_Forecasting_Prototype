# Build stage - Node.js
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install Node dependencies
RUN npm ci

# Copy source
COPY . .

# Build React app
RUN npm run build && echo "Build complete, dist contents:" && ls -la dist/

# Runtime stage - Python with Node
FROM python:3.11-slim

WORKDIR /app

# Install Node.js (for any runtime needs)
RUN apt-get update && apt-get install -y nodejs npm && rm -rf /var/lib/apt/lists/*

# Copy built React app from builder
COPY --from=builder /app/dist ./dist

# Verify dist folder
RUN echo "Dist folder contents:" && ls -la dist/ || echo "ERROR: dist folder is empty!"

# Copy backend files
COPY backend ./backend
COPY backend/requirements.txt ./backend/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir gunicorn
RUN pip install --no-cache-dir -r backend/requirements.txt

# Expose port
EXPOSE 8000

# Set working directory to backend
WORKDIR /app/backend

# Start Flask app with gunicorn
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000", "--worker-class", "sync", "--timeout", "120", "--workers", "2"]
