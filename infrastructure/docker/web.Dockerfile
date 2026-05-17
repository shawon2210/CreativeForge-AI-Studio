# ---- Build stage ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy web app source
COPY apps/web/ ./

# Install dependencies and build
RUN npm install --legacy-peer-deps && \
    npm run build

# ---- Production stage ----
FROM nginx:stable-alpine

# Copy custom nginx config
COPY infrastructure/docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
