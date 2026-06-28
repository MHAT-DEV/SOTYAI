# Stage 1: Build Environment
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies first for layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the application
COPY . .

# Build the frontend (Vite) and backend (esbuild)
RUN npm run build

# Prune dev dependencies for production
RUN npm ci --omit=dev

# Stage 2: Production Runtime
FROM node:22-alpine AS production

WORKDIR /app

# Install OS level dependencies for healthchecks
RUN apk add --no-cache curl tzdata

# Set timezone
ENV TZ=Asia/Bangkok

# Copy built assets and dependencies from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Expose ports (3000 for backend, 3001 for MCP - overridable via docker-compose)
EXPOSE 3000 3001

# Add a healthcheck script inside the container
COPY healthcheck.sh /usr/local/bin/healthcheck
RUN chmod +x /usr/local/bin/healthcheck

# Use node non-root user
USER node

# Start the application using the compiled CommonJS server bundle
CMD ["node", "dist/server.cjs"]
