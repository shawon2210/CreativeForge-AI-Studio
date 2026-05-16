# Docker Setup Guide

## 1. Frontend Dockerfile (apps/web/Dockerfile)
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY infrastructure/nginx/web.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 2. Backend API Dockerfile (apps/api/Dockerfile)
```dockerfile
FROM python:3.13-slim
WORKDIR /app
COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## 3. Worker Dockerfile (apps/workers/Dockerfile)
```dockerfile
FROM python:3.13-slim
# GPU support (uncomment for production GPU mode)
# RUN apt-get update && apt-get install -y nvidia-cuda-toolkit
WORKDIR /app
COPY pyproject.toml requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY src/ ./src
CMD ["celery", "-A", "src.worker", "worker", "--loglevel=info", "--concurrency=4"]
```

---

## 4. Development Docker Compose (infrastructure/docker/docker-compose.dev.yml)
```yaml
version: '3.8'
services:
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    environment:
      - VITE_API_URL=http://localhost:8000
    command: npm run dev

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    volumes:
      - ./apps/api:/app
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/creativeforge
      - REDIS_URL=redis://redis:6379/0
      - AI_MODE=mock
    command: uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload

  worker:
    build:
      context: ./apps/workers
      dockerfile: Dockerfile
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/creativeforge
      - REDIS_URL=redis://redis:6379/0
      - AI_MODE=mock
    depends_on:
      - api
      - redis

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=creativeforge
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

---

## 5. Production Docker Compose (infrastructure/docker/docker-compose.prod.yml)
```yaml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./infrastructure/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./infrastructure/nginx/ssl:/etc/nginx/ssl
    depends_on:
      - web
      - api

  web:
    build: ./apps/web
    environment:
      - VITE_API_URL=https://api.creativeforge.ai
    restart: unless-stopped

  api:
    build: ./apps/api
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - AI_MODE=production
      - GPU_ENABLED=true
    restart: unless-stopped
    deploy:
      replicas: 3

  worker:
    build: ./apps/workers
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - AI_MODE=production
    restart: unless-stopped
    deploy:
      replicas: 5
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

---

## 6. NGINX Configuration (infrastructure/nginx/nginx.conf)
```nginx
events { worker_connections 1024; }
http {
    server {
        listen 80;
        server_name creativeforge.ai;
        return 301 https://$host$request_uri;
    }
    server {
        listen 443 ssl;
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }
        location /api/ {
            proxy_pass http://api:8000;
            proxy_set_header Host $host;
        }
        location /ws/ {
            proxy_pass http://api:8000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```