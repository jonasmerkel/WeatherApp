# Multi-stage build for production optimization
# Stage 1: Build stage
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install ALL dependencies (including devDependencies for build)
RUN npm ci

# Copy source files
COPY src/ ./src/
COPY public/ ./public/

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production stage with nginx
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built application to nginx html directory
COPY --from=builder /app/public /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html/dist

# Set proper permissions for nginx
RUN chmod -R 755 /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]