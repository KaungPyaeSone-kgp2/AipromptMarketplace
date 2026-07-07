#!/bin/bash
# Railway injects PORT env variable. Apache needs to listen on it.
PORT=${PORT:-80}

# Force Apache to ONLY listen on the injected PORT
echo "Listen ${PORT}" > /etc/apache2/ports.conf

# Replace ${PORT} in our custom virtualhost config with the actual number
sed -i "s/\*:\${PORT}/*:${PORT}/g" /etc/apache2/sites-available/000-default.conf

# Start Apache in foreground
exec apache2-foreground
