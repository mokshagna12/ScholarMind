# ==========================================
# STAGE 1: Build Vite React Frontend
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy dependency manifests and install packages
COPY frontend/package*.json ./
RUN npm install

# Copy source and compile production bundle
COPY frontend/ ./
RUN npm run build

# ==========================================
# STAGE 2: Package Full-Stack FastAPI Server
# ==========================================
FROM python:3.9-slim
WORKDIR /app

# Install system dependencies (build-essential needed for compiling any C-dependencies)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /lib/apt/lists/*

# Install python requirements
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy compiled React static assets from Stage 1 into backend static directory
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port (FastAPI default, overridden dynamically by hosting environments via $PORT)
EXPOSE 8000

# Set environment variables for production
ENV PYTHONUNBUFFERED=1

# Command to run the application (binds to $PORT variable provided by Hugging Face / Render)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-7860}"]
