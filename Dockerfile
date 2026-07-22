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

# Enable Apache modules: rewrite (clean URLs), headers (CORS), env (PassEnv)
RUN a2enmod rewrite headers env

# Install PHP extensions and system dependencies needed
RUN apt-get update && apt-get install -y \
    unzip libzip-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libmagickwand-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) gd pdo pdo_mysql zip \
    && pecl install imagick \
    && docker-php-ext-enable imagick

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Enforce Secure & SameSite=None for all PHP sessions and increase upload limits
RUN echo "session.cookie_samesite = None" >> /usr/local/etc/php/conf.d/session-cookies.ini && \
    echo "session.cookie_secure = 1" >> /usr/local/etc/php/conf.d/session-cookies.ini && \
    echo "session.cookie_httponly = 1" >> /usr/local/etc/php/conf.d/session-cookies.ini && \
    printf "upload_max_filesize = 25M\npost_max_size = 30M\nmemory_limit = 256M\n" > /usr/local/etc/php/conf.d/uploads.ini

# Copy all backend PHP files to the working directory
# Note: we specifically copy the contents of the `backend/` folder into `/var/www/html/`
COPY backend/ .

# Install PHP dependencies (google/apiclient, phpmailer)
RUN composer install --no-dev --optimize-autoloader

# Copy the built React app from Stage 1 into the same Apache root directory
# This allows Apache to serve index.html and assets directly
COPY --from=frontend-builder /app/dist /var/www/html/

# Configure Apache
RUN cp .docker/apache.conf /etc/apache2/sites-available/000-default.conf

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
RUN cp .docker/start.sh /start.sh && chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
