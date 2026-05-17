FROM python:3.13-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy API code
COPY apps/api /app/

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
    fastapi>=0.115.0 \
    uvicorn>=0.30.0 \
    sqlmodel>=0.0.24 \
    sqlalchemy>=2.0.0 \
    psycopg2-binary>=2.9.0 \
    redis>=5.0.0 \
    pydantic>=2.0.0 \
    httpx>=0.27.0 \
    pytest>=8.0.0

EXPOSE 5000

# Use mock main for CI (no DB required), production main for real deployments
CMD ["python", "main_mock.py"]
