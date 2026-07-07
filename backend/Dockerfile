FROM php:8.2-apache

# Suppress "Could not reliably determine FQDN" warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Enable Apache mod_rewrite for clean API URLs
RUN a2enmod rewrite headers


# Install PHP extensions needed
RUN docker-php-ext-install pdo pdo_mysql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy all backend files
COPY . .

# Install PHP dependencies (google/apiclient, phpmailer)
RUN composer install --no-dev --optimize-autoloader

# Copy Apache config
COPY .docker/apache.conf /etc/apache2/sites-available/000-default.conf

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
# Use a startup script to set the port dynamically
COPY .docker/start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
