# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (for better layer caching)
COPY apps/web/package.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source code
COPY apps/web/ ./

# Build
RUN npm run build

# ---- Production stage ----
FROM nginx:stable-alpine

# Copy custom nginx config
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
