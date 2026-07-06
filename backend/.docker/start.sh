#!/bin/bash
# Railway injects PORT env variable. Apache needs to listen on it.
PORT=${PORT:-80}

# Update Apache to listen on Railway's PORT
sed -i "s/Listen 80/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/*:80/*:${PORT}/" /etc/apache2/sites-available/000-default.conf

# Start Apache in foreground
apache2-foreground
