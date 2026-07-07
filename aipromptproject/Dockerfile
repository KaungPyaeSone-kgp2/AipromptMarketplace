# =============================================
# Stage 1: Build the Vite/React app
# =============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for layer caching
COPY package*.json ./

# Clean install — requires package-lock.json to be in sync
RUN npm ci

# Copy all source files (see .dockerignore for exclusions)
COPY . .

# Build production bundle → outputs to /app/dist
RUN npm run build

# =============================================
# Stage 2: Serve the built app
# =============================================
FROM node:20-alpine AS runner

WORKDIR /app

# Install serve globally so it's available on PATH
# (no npx, no node_modules path needed)
RUN npm install -g serve@14

# Copy only the built output from the builder stage
COPY --from=builder /app/dist ./dist

# Railway injects $PORT dynamically — default to 3000 for local dev
EXPOSE 3000

# Use sh -c so $PORT env variable is expanded at container runtime
CMD ["sh", "-c", "serve dist -s --listen tcp://0.0.0.0:${PORT:-3000}"]
