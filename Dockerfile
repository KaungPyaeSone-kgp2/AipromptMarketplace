# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# We no longer need VITE_API_BASE_URL injected here because 
# the frontend and backend are on the exact same domain.
# It will natively make relative requests to /api/

# Copy package files first for layer caching
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Build production bundle -> outputs to /app/dist
RUN npm run build

# ==========================================
# Stage 2: Build the PHP Backend and Serve Both
# ==========================================
FROM php:8.2-apache

# Suppress "Could not reliably determine FQDN" warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Enable Apache mod_rewrite for clean API URLs and React Router fallback
RUN a2enmod rewrite headers

# Install PHP extensions and system dependencies needed
RUN apt-get update && apt-get install -y unzip libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Enforce Secure & SameSite=None for all PHP sessions to fix cross-domain cookies
# (Even though they are on the same domain now, this is still good practice for security)
RUN echo "session.cookie_samesite = None" >> /usr/local/etc/php/conf.d/session-cookies.ini && \
    echo "session.cookie_secure = 1" >> /usr/local/etc/php/conf.d/session-cookies.ini && \
    echo "session.cookie_httponly = 1" >> /usr/local/etc/php/conf.d/session-cookies.ini

# Copy all backend PHP files to the working directory
# Note: we specifically copy the contents of the `backend/` folder into `/var/www/html/`
COPY backend/ .

# Install PHP dependencies (google/apiclient, phpmailer)
RUN composer install --no-dev --optimize-autoloader

# Copy the built React app from Stage 1 into the same Apache root directory
# This allows Apache to serve index.html and assets directly
COPY --from=frontend-builder /app/dist /var/www/html/

# Copy Apache config (this handles routing React vs PHP)
COPY backend/.docker/apache.conf /etc/apache2/sites-available/000-default.conf

# Fix file permissions and ensure ONLY mpm_prefork is loaded (required for mod_php)
RUN chown -R www-data:www-data /var/www/html \
    && find /var/www/html -type d -exec chmod 755 {} \; \
    && find /var/www/html -type f -exec chmod 644 {} \; \
    && a2dismod mpm_event mpm_worker || true \
    && a2enmod mpm_prefork \
    && rm -f /etc/apache2/mods-enabled/mpm_event.load \
             /etc/apache2/mods-enabled/mpm_event.conf \
             /etc/apache2/mods-enabled/mpm_worker.load \
             /etc/apache2/mods-enabled/mpm_worker.conf || true

# Railway injects PORT env variable — Apache must listen on it
COPY backend/.docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
