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
# Stage 2: Serve with nginx (no Node.js needed)
# =============================================
FROM nginx:alpine

# Copy built React app into nginx's web root
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy our nginx config template (uses __PORT__ placeholder)
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Remove the default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Railway injects $PORT — use sed to replace __PORT__ at container startup
# Falls back to port 80 if PORT is not set
EXPOSE 80

CMD ["/bin/sh", "-c", \
  "sed 's/__PORT__/'\"${PORT:-80}\"'/g' /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf && \
  nginx -g 'daemon off;'"]
